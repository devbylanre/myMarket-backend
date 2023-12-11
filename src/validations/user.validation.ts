import { ValidationUtil } from '../utils/validation.util';

export class UserValidation extends ValidationUtil {
  public createUser() {
    return [
      this.isBoolean('isSeller', 'Specify whether you are a seller or not'),
      this.isString(
        this.isNotEmpty('firstName', 'Provide your first name'),
        'First name must be of string data type'
      ),
      this.isString(
        this.isNotEmpty('lastName', 'Provide your last name'),
        'Last name must be of string data type'
      ),
      this.isEmail(
        this.isNotEmpty('contact.email', 'Provide your email address'),
        'Provide a valid email address'
      ),
      this.isLength(
        this.isString(
          this.isNotEmpty('bio', 'Provide your bio'),
          'Bio must contain a valid string data type'
        ),
        { min: 100, max: 250 },
        'Your bio must contain a minimum character of length 100 and maximum character of length 250'
      ),
      this.isString(
        this.isNotEmpty('store.name', 'What will your store be called?'),
        'Store name must only contain string'
      ).optional(),
      this.isString(
        this.isNotEmpty('store.description', 'Provide your store description'),
        'Store description must only contain string'
      ).optional(),
      this.isStrongPassword(
        this.isString(
          this.isNotEmpty('password', 'Provide your password'),
          'Password must be of string data type'
        ),
        'Use a strong password'
      ),
    ];
  }

  public authUser() {
    return [
      this.isEmail(
        this.isNotEmpty('email', 'Provide your email address'),
        'Provide a valid email address'
      ),
      this.isNotEmpty('password', 'Provide your password'),
    ];
  }

  public paramID() {
    return [this.isParamObjectID('id', 'Invalid user ID')];
  }

  public verifyToken() {
    return [
      this.isParamObjectID('id', 'Invalid user ID'),
      this.isLength(
        this.isNotEmpty('key', 'Provide your OTP key'),
        { min: 6 },
        'Key requires at least 6 characters'
      ),
    ];
  }

  public resetPassword() {
    return [
      this.isParamObjectID('id', 'Invalid user ID'),
      this.isString(
        this.isNotEmpty('oldPassword', 'Provide your old password'),
        'Old password requires strings'
      ),
      this.isStrongPassword(
        this.isNotEmpty('newPassword', 'Provide your new password'),
        'Use a combination of letters, numbers, and special characters to form a strong password'
      ),
    ];
  }

  public changeEmail() {
    return [
      this.isParamObjectID('id', 'Invalid user ID'),
      this.isEmail(
        this.isNotEmpty('email', 'Provide your email address'),
        'Provide a valid email address'
      ),
    ];
  }

  public changeMobile() {
    return [
      this.isParamObjectID('id', 'Invalid user ID'),
      this.isString(
        this.isNotEmpty('mobile.country', 'Provide your country'),
        'Country must be a valid string'
      ),
      this.isNumber('mobile.countyCode', 'Provide your country code'),
      this.isNumber('mobile.number', 'Provide your mobile number'),
    ];
  }

  public updateUser() {
    return [
      this.isParamObjectID('id', 'Invalid user ID'),
      this.isBoolean(
        'isSeller',
        'isSeller requires true or false value'
      ).optional(),
      this.isNumber('balance', 'Balance requires a number').optional(),
      this.isString(
        this.isNotEmpty('firstName', 'Provide your first name'),
        'First name only accepts strings'
      ).optional(),
      this.isString(
        this.isNotEmpty('lastName', 'Provide your last name'),
        'Last name only accepts strings'
      ).optional(),
      this.isLength(
        this.isString(
          this.isNotEmpty('bio', 'Provide your bio'),
          'Bio requires string values'
        ),
        { min: 100, max: 250 },
        'Bio requires a minimum of 100 characters and maximum of 250 characters'
      ).optional(),
      this.isBoolean(
        'isVerified',
        'isVerified requires true or false value'
      ).optional(),
      this.isString(
        this.isNotEmpty('billing.state', 'Provide your billing state'),
        'Billing state only accepts strings'
      ).optional(),
      this.isString(
        this.isNotEmpty('billing.city', 'Provide your billing city'),
        'Billing city only accepts strings'
      ).optional(),
      this.isString(
        this.isNotEmpty('billing.address', 'Provide your billing address'),
        'Billing address only accepts strings'
      ).optional(),
      this.isString(
        this.isNotEmpty('store.name', 'Provide your store name'),
        'Store name only accepts strings'
      ).optional(),
      this.isString(
        this.isNotEmpty('store.description', 'Provide your store description'),
        'Store description only accepts strings'
      ).optional(),
      this.isString(
        this.isNotEmpty('store.location.state', 'Store location state'),
        'Store location state only accepts strings'
      ).optional(),
      this.isString(
        this.isNotEmpty('store.location.city', 'Store location city'),
        'Store location city only accepts strings'
      ).optional(),
      this.isString(
        this.isNotEmpty('store.location.address', 'Store location address'),
        'Store location address only accepts strings'
      ).optional(),
      this.isArray('social', 'Social accounts must be an array').optional(),
      this.isURL(
        this.isNotEmpty('social.*', 'Provide your social account'),
        'Social account must be a valid URL'
      ).optional(),
    ];
  }
}
