import { IEvent } from '@/core/types';
import { model, Schema, CallbackWithoutResultAndOptionalError, HydratedDocument } from 'mongoose';
import slugify from 'slugify';

const { ObjectId } = Schema.Types;

const EventSchema = new Schema<IEvent>(
  {
    title: { type: String, required: true, trim: true },
    enTitle: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, lowercase: true, index: true },
    city: { type: String, required: true },
    description: { type: String, required: true },
    capacity: { type: Number, required: true, min: 1 },
    sessions: { type: Number, required: true, min: 1 },
    eventDate: { type: Date, required: true },
    price: { type: Number, required: true, min: 0 },
    thumbnail: { type: String, required: true },
    owner: { type: ObjectId, ref: 'User', required: true },
    isActive: { type: Boolean, default: true },
    isOpen: { type: Boolean, default: false },
    closeReason: { type: String, default: '' },
    attendees: [
      {
        user: { type: ObjectId, ref: 'User', required: true },
        registeredAt: { type: Date, default: Date.now },
        paymentStatus: {
          type: String,
          enum: ['pending', 'paid', 'failed'],
          default: 'pending',
        },
      },
    ],
    availableSeats: {
      type: Number,
      default: function () {
        return this.capacity;
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

EventSchema.pre(
  'save',
  function (this: HydratedDocument<IEvent>, next: CallbackWithoutResultAndOptionalError) {
    if (!this.slug || this.isModified('enTitle') || this.isModified('title')) {
      this.slug = slugify(this.enTitle || this.title, { lower: true, strict: true });
    }
    next();
  }
);

EventSchema.virtual('thumbnailUrl').get(function (this: IEvent) {
  return this.thumbnail ? `${process.env.SERVER_URL}/${this.thumbnail}` : null;
});

export const EventModel = model<IEvent>('Event', EventSchema);
