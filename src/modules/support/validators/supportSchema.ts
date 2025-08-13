import Joi from 'joi';
import createHttpError from 'http-errors';

export const supportRequestValidator = Joi.object({
  firstName: Joi.string()
    .min(2)
    .max(50)
    .pattern(/^[\u0600-\u06FFa-zA-Z\s]+$/)
    .required()
    .messages({
      'string.empty': 'نام الزامی است',
      'string.min': 'نام باید حداقل ۲ کاراکتر باشد',
      'string.max': 'نام نباید بیشتر از ۵۰ کاراکتر باشد',
      'string.pattern.base': 'نام شما باید فقط شامل حروف فارسی یا انگلیسی باشد',
      'any.required': 'نام الزامی است',
    }),

  lastName: Joi.string()
    .min(2)
    .max(50)
    .pattern(/^[\u0600-\u06FFa-zA-Z\s]+$/)
    .required()
    .messages({
      'string.empty': 'نام خانوادگی الزامی است',
      'string.min': 'نام خانوادگی باید حداقل ۲ کاراکتر باشد',
      'string.max': 'نام خانوادگی نباید بیشتر از ۵۰ کاراکتر باشد',
      'string.pattern.base': 'نام خانوادگی شما باید فقط شامل حروف فارسی یا انگلیسی باشد',
      'any.required': 'نام خانوادگی الزامی است',
    }),

  email: Joi.string().email().required().messages({
    'string.empty': 'ایمیل الزامی است',
    'string.email': 'ایمیل وارد شده صحیح نمی‌باشد',
    'any.required': 'ایمیل الزامی است',
  }),

  phoneNumber: Joi.string()
    .pattern(/^09\d{9}$/)
    .required()
    .messages({
      'string.empty': 'شماره موبایل الزامی است',
      'string.pattern.base': 'شماره موبایل وارد شده صحیح نمی‌باشد',
      'any.required': 'شماره موبایل الزامی است',
    }),
}).error(errors => {
  throw createHttpError.BadRequest(errors.map(err => err.message).join('، '));
});
