package firstvoices.api;

import io.lettuce.core.codec.RedisCodec;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;
import java.nio.ByteBuffer;
import java.nio.charset.Charset;

public class JDKSerializerCodec implements RedisCodec<String, Object> {
  private final Charset charset = Charset.forName("UTF-8");

  @Override
  public String decodeKey(ByteBuffer bytes) {
    return charset.decode(bytes).toString();
  }

  @Override
  public Object decodeValue(ByteBuffer bytes) {
    try {
      byte[] array = new byte[bytes.remaining()];
      bytes.get(array);
      ObjectInputStream is = new ObjectInputStream(new ByteArrayInputStream(array));
      return is.readObject();
    } catch (Exception e) {
      throw (new RuntimeException(e));
      //return null;
    }
  }

  @Override
  public ByteBuffer encodeKey(String key) {
    return ByteBuffer.wrap(charset.encode(key).array());
  }

  @Override
  public ByteBuffer encodeValue(Object value) {
    try {
      ByteArrayOutputStream bytes = new ByteArrayOutputStream();
      ObjectOutputStream os = new ObjectOutputStream(bytes);
      os.writeObject(value);
      return ByteBuffer.wrap(bytes.toByteArray());
    } catch (IOException e) {
      throw (new RuntimeException(e));
      //	return null;
    }
  }

}
