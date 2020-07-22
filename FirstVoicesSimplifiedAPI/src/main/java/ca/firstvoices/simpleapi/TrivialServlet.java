package ca.firstvoices.simpleapi;

import java.io.IOException;
import java.io.PrintWriter;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class TrivialServlet extends HttpServlet {

  @Override
  protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
    resp.setStatus(201);
    resp.setHeader("X-Allaboard", "Aww yeah");
    PrintWriter pw = new PrintWriter(resp.getOutputStream());
    pw.write("It is " + System.currentTimeMillis() + " and all is well");
    pw.flush();
  }
}
