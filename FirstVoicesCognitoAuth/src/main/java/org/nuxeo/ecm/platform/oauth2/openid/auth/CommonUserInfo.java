package org.nuxeo.ecm.platform.oauth2.openid.auth;

import com.google.api.client.json.GenericJson;
import com.google.api.client.util.DateTime;
import com.google.api.client.util.Key;
import java.util.Date;

public abstract class CommonUserInfo extends GenericJson implements OpenIDUserInfo {

  @Key("sub") protected String subject = null;

  @Key("name") protected String name = null;

  @Key("given_name") protected String givenName = null;

  @Key("family_name") protected String familyName = null;

  @Key("middle_name") protected String middleName = null;

  @Key("nickname") protected String nickname = null;

  @Key("preferred_username") protected String preferredUsername = null;

  @Key("profile") protected String profile = null;

  @Key("picture") protected String picture = null;

  @Key("website") protected String website = null;

  @Key("email") protected String email = null;

  @Key("email_verified") protected boolean emailVerified = false;

  @Key("gender") protected String gender = null;

  @Key("birthdate") protected Date birthdate = null;

  @Key("zoneinfo") protected String zoneInfo = null;

  @Key("locale") protected String locale = null;

  @Key("phone_number") protected String phoneNumber = null;

  @Key("address") protected String address = null;

  @Key("updated_time") protected String updatedTime = null;

  @Override
  public String getSubject() {
    return subject;
  }

  @Override
  public String getName() {
    return name;
  }

  @Override
  public String getGivenName() {
    return givenName;
  }

  @Override
  public String getFamilyName() {
    return familyName;
  }

  @Override
  public String getMiddleName() {
    return middleName;
  }

  @Override
  public String getNickname() {
    return nickname;
  }

  @Override
  public String getPreferredUsername() {
    return preferredUsername;
  }

  @Override
  public String getProfile() {
    return profile;
  }

  @Override
  public String getPicture() {
    return picture;
  }

  @Override
  public String getWebsite() {
    return website;
  }

  @Override
  public String getEmail() {
    return email;
  }

  @Override
  public boolean isEmailVerified() {
    return emailVerified;
  }

  @Override
  public String getGender() {
    return gender;
  }

  @Override
  public Date getBirthdate() {
    return birthdate;
  }

  @Override
  public String getZoneInfo() {
    return zoneInfo;
  }

  @Override
  public String getLocale() {
    return locale;
  }

  @Override
  public String getPhoneNumber() {
    return phoneNumber;
  }

  @Override
  public String getAddress() {
    return address;
  }

  @Override
  public Date getUpdatedTime() {
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
