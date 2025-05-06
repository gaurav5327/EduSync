import mongoose from "mongoose"

const notificationSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: [
            "AVAILABILITY_UPDATE",
            "CONFLICT_RESOLUTION_FAILED",
            "SCHEDULE_UPDATE_FAILED",
            "SCHEDULE_UPDATE_ERROR",
            "TEACHER_ABSENCE",
            "SCHEDULE_CHANGE_REQUEST",
        ],
    },
    message: {
        type: String,
        required: true,
    },
    data: {
        type: mongoose.Schema.Types.Mixed,
    },
    status: {
        type: String,
        enum: ["PENDING", "APPROVED", "REJECTED"],
        default: "PENDING",
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
})

export default mongoose.model("Notification", notificationSchema)
