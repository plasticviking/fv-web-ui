package org.nuxeo.ecm.platform.oauth2.openid.auth;

import com.google.api.client.util.DateTime;
import com.google.api.client.util.Key;
import java.util.Date;

public interface CommonUserInfo extends OpenIDUserInfo {

  @Key("sub") String subject = null;

  @Key("name") String name = null;

  @Key("given_name") String givenName = null;

  @Key("family_name") String familyName = null;

  @Key("middle_name") String middleName = null;

  @Key("nickname") String nickname = null;

  @Key("preferred_username") String preferredUsername = null;

  @Key("profile") String profile = null;

  @Key("picture") String picture = null;

  @Key("website") String website = null;

  @Key("email") String email = null;

  @Key("email_verified") boolean emailVerified = false;

  @Key("gender") String gender = null;

  @Key("birthdate") Date birthdate = null;

  @Key("zoneinfo") String zoneInfo = null;

  @Key("locale") String locale = null;

  @Key("phone_number") String phoneNumber = null;

  @Key("address") String address = null;

  @Key("updated_time") String updatedTime = null;

  @Override
  default String getSubject() {
    return subject;
  }

  @Override
  default String getName() {
    return name;
  }

  @Override
  default String getGivenName() {
    return givenName;
  }

  @Override
  default String getFamilyName() {
    return familyName;
  }

  @Override
  default String getMiddleName() {
    return middleName;
  }

  @Override
  default String getNickname() {
    return nickname;
  }

  @Override
  default String getPreferredUsername() {
    return preferredUsername;
  }

  @Override
  default String getProfile() {
    return profile;
  }

  @Override
  default String getPicture() {
    return picture;
  }

  @Override
  default String getWebsite() {
    return website;
  }

  @Override
  default String getEmail() {
    return email;
  }

  @Override
  default boolean isEmailVerified() {
    return emailVerified;
  }

  @Override
  default String getGender() {
    return gender;
  }

  @Override
  default Date getBirthdate() {
    return birthdate;
  }

  @Override
  default String getZoneInfo() {
    return zoneInfo;
  }

  @Override
  default String getLocale() {
    return locale;
  }

  @Override
  default String getPhoneNumber() {
    return phoneNumber;
  }

  @Override
  default String getAddress() {
    return address;
  }

  @Override
  default Date getUpdatedTime() {
    Date date;
    try {
      DateTime dateTime = DateTime.parseRfc3339(updatedTime);
      date = new Date(dateTime.getValue());
    } catch (NumberFormatException e) {
      return null;
    }
    return date;
  }
}
