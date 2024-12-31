const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");
const listingSchema = new Schema({
    title:
    {
        type: String,
        required: true,
    },
    description: String,
    image:
    {
        filename: {
            type: String,

        },
        url: {
            type: String,

            set: (v) => v == "" ? "https://cdn.sanity.io/images/ocl5w36p/prod2/e9f203d991db39a99e7f5dba008deb65efec6e87-3840x1860.jpg" : v,
            default: "https://cdn.sanity.io/images/ocl5w36p/prod2/e9f203d991db39a99e7f5dba008deb65efec6e87-3840x1860.jpg",
        },

    },
    price: Number,
    location: String,
    country: String,
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review',
        }
    ],

    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    place: {
        type: String,
        enum: ['trending', 'rooms', 'cities', 'mountains', 'castles', 'pools', 'camping', 'farms', 'arctic', 'domes'],
        default: 'trending',
    }

});

listingSchema.post("findOneAndDelete", async (listing) => {

    if (listing) {
        await Review.deleteMany({ _id: { $in: listing.reviews } });
    }
})

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;