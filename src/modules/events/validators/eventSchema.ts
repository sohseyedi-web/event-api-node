import Joi from 'joi';
import createHttpError from 'http-errors';
import { Types } from 'mongoose';

const objectIdValidator = (value: string, helpers: any) => {
  if (!Types.ObjectId.isValid(value)) {
    return helpers.error('any.invalid');
  }
  return value;
};

export const addNewEventSchema = Joi.object({
  title: Joi.string()
    .min(5)
    .max(100)
    .required()
    .error(createHttpError.BadRequest('عنوان رویداد باید بین ۵ تا ۱۰۰ کاراکتر باشد')),

  enTitle: Joi.string()
    .min(5)
    .max(100)
    .regex(/^[a-zA-Z0-9\s]+$/)
    .required()
    .error(createHttpError.BadRequest('عنوان انگلیسی باید فقط شامل حروف و اعداد لاتین باشد')),

  description: Joi.string()
    .min(20)
    .required()
    .error(createHttpError.BadRequest('توضیحات رویداد باید حداقل ۲۰ کاراکتر باشد')),

  city: Joi.string()
    .required()
    .error(createHttpError.BadRequest('شهر برگزاری رویداد را مشخص کنید')),

  capacity: Joi.number()
    .integer()
    .min(1)
    .required()
    .error(createHttpError.BadRequest('ظرفیت رویداد باید عددی بیشتر از صفر باشد')),

  sessions: Joi.number()
    .integer()
    .min(1)
    .required()
    .error(createHttpError.BadRequest('تعداد سانس‌ها باید عددی بیشتر از صفر باشد')),

  eventDate: Joi.date()
    .greater('now')
    .required()
    .error(createHttpError.BadRequest('تاریخ رویداد باید در آینده باشد')),

  price: Joi.number()
    .min(0)
    .required()
    .error(createHttpError.BadRequest('قیمت رویداد باید عددی معتبر باشد')),

  thumbnail: Joi.string()
    .uri()
    .required()
    .error(createHttpError.BadRequest('آدرس تصویر کاور معتبر نیست')),

  owner: Joi.string()
    .custom(objectIdValidator)
    .required()
    .error(createHttpError.BadRequest('شناسه مالک معتبر نیست')),
});

export const updateEventSchema = Joi.object({
  title: Joi.string()
    .min(5)
    .max(100)
    .error(createHttpError.BadRequest('عنوان رویداد باید بین ۵ تا ۱۰۰ کاراکتر باشد')),

  enTitle: Joi.string()
    .min(5)
    .max(100)
    .regex(/^[a-zA-Z0-9\s]+$/)
    .required()
    .error(createHttpError.BadRequest('عنوان انگلیسی باید فقط شامل حروف و اعداد لاتین باشد')),

  description: Joi.string()
    .min(20)
    .error(createHttpError.BadRequest('توضیحات رویداد باید حداقل ۲۰ کاراکتر باشد')),

  city: Joi.string().error(createHttpError.BadRequest('شهر برگزاری رویداد را مشخص کنید')),

  capacity: Joi.number()
    .integer()
    .min(1)
    .error(createHttpError.BadRequest('ظرفیت رویداد باید عددی بیشتر از صفر باشد')),

  sessions: Joi.number()
    .integer()
    .min(1)
    .error(createHttpError.BadRequest('تعداد سانس‌ها باید عددی بیشتر از صفر باشد')),

  eventDate: Joi.date()
    .greater('now')
    .error(createHttpError.BadRequest('تاریخ رویداد باید در آینده باشد')),

  price: Joi.number().min(0).error(createHttpError.BadRequest('قیمت رویداد باید عددی معتبر باشد')),

  thumbnail: Joi.string().uri().error(createHttpError.BadRequest('آدرس تصویر کاور معتبر نیست')),

  isActive: Joi.boolean().error(createHttpError.BadRequest('وضعیت فعال/غیرفعال باید بولین باشد')),
});

export const eventQuerySchema = Joi.object({
  search: Joi.string().allow('').max(100).error(createHttpError.BadRequest('متن جستجو معتبر نیست')),

  sort: Joi.string()
    .valid('latest', 'earliest', 'popular')
    .default('latest')
    .error(createHttpError.BadRequest('ترتیب مرتب‌سازی معتبر نیست')),

  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .error(createHttpError.BadRequest('شماره صفحه معتبر نیست')),

  limit: Joi.number()
    .integer()
    .min(1)
    .max(50)
    .default(10)
    .error(createHttpError.BadRequest('تعداد آیتم‌های هر صفحه معتبر نیست')),
});
