import mongoose from "mongoose";

const groupSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        membersId: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        }],
        adminId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        groupPic: {
            type: String,
            default: "",
        },
    },
    { timestamps: true }
);

const Group = mongoose.model("Group", groupSchema);

export default Group;