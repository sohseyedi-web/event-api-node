const Joi = require('joi');
const createHttpError = require('http-errors');

export const getOtpSchema = Joi.object({
  email: Joi.string().email().error(createHttpError.BadRequest('ایمیل وارد شده صحیح نمی باشد')),
  role: Joi.string()
    .valid('USER', 'OWNER')
    .optional()
    .error(createHttpError.BadRequest('نقش انتخاب‌شده معتبر نیست')),
});

export const checkOtpSchema = Joi.object({
  otp: Joi.string().min(5).max(6).error(createHttpError.BadRequest('کد ارسال شده صحیح نمیباشد')),
  email: Joi.string().email().error(createHttpError.BadRequest('ایمیل وارد شده صحیح نمی باشد')),
});

export const userProfileSchema = Joi.object({
  name: Joi.string()
    .min(5)
    .max(100)
    .required()
    .error(createHttpError.BadRequest('نام کاربری وارد شده صحیح نمی باشد')),
});

export const ownerProfileSchema = Joi.object({
  name: Joi.string()
    .min(5)
    .max(100)
    .required()
    .error(createHttpError.BadRequest('نام کاربری وارد شده صحیح نیست ')),

  faCity: Joi.string()
    .pattern(/^[\u0600-\u06FF\s]+$/)
    .required()
    .error(createHttpError.BadRequest('نام شهر به صورت فارسی وارد شود')),

  enCity: Joi.string()
    .pattern(/^[A-Za-z\s]+$/)
    .required()
    .error(createHttpError.BadRequest('نام شهر به صورت انگلیسی وارد شود')),

  address: Joi.string()
    .min(1)
    .required()
    .error(createHttpError.BadRequest('آدرس وارد شده صحیح نیست')),
});
export const supportProfileSchema = Joi.object({
  faCity: Joi.string()
    .pattern(/^[\u0600-\u06FF\s]+$/)
    .required()
    .error(createHttpError.BadRequest('نام شهر به صورت فارسی وارد شود')),

  enCity: Joi.string()
    .pattern(/^[A-Za-z\s]+$/)
    .required()
    .error(createHttpError.BadRequest('نام شهر به صورت انگلیسی وارد شود')),

  address: Joi.string()
    .min(1)
    .required()
    .error(createHttpError.BadRequest('آدرس وارد شده صحیح نیست')),
});

export const updateProfileSchema = Joi.object({
  name: Joi.string()
    .min(5)
    .max(50)
    .required()
    .error(createHttpError.BadRequest('نام کاربری وارد شده صحیح نمی باشد')),
  email: Joi.string().email().error(createHttpError.BadRequest('ایمیل وارد شده صحیح نمی باشد')),
  faCity: Joi.string()
    .pattern(/^[\u0600-\u06FF\s]+$/)
    .error(createHttpError.BadRequest('نام شهر به صورت فارسی وارد شود')),
  enCity: Joi.string()
    .pattern(/^[A-Za-z\s]+$/)
    .error(createHttpError.BadRequest('نام شهر به صورت انگلیسی وارد شود')),

  address: Joi.string().min(1).error(createHttpError.BadRequest('آدرس وارد شده صحیح نیست')),
});
