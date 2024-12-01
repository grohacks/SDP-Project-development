import User from "../models/UserSchema.js";
import Doctor from "../models/DoctorSchema.js";
import Booking from "../models/BookingSchema.js";
import Stripe from "stripe";

export const getCheckoutSession = async (req, res) => {
    try {
        // Get currently booked doctor
        const doctor = await Doctor.findById(req.params.doctorId);
        const user = await User.findById(req.userId);
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

        // Convert INR to USD (assuming 1 USD = 75 INR, for example)
        const conversionRate = 75; // You should use an up-to-date conversion rate from a reliable source
        const ticketPriceInUSD = doctor.ticketPrice / conversionRate;

        // Create Stripe checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            success_url: `${process.env.CLIENT_SITE_URL}/checkout-success`,
            cancel_url: `${req.protocol}://${req.get('host')}/doctors/${doctor.id}`,
            customer_email: user.email,
            client_reference_id: req.params.doctorId,
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        unit_amount: Math.round(ticketPriceInUSD * 100), // Stripe expects the amount in cents
                        product_data: {
                            name: doctor.name,
                            description: doctor.bio,
                            images: [doctor.photo]
                        }
                    },
                    quantity: 1
                }
            ]
        });

        // Create new booking
        const booking = new Booking({
            doctor: doctor._id,
            user: user._id,
            ticketPrice: doctor.ticketPrice,
            session: session.id
        });

        await booking.save();
        res.status(200).json({ success: true, message: 'Successfully paid', session });

    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: 'Error creating checkout session' });
    }
};
