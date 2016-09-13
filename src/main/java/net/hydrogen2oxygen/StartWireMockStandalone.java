package net.hydrogen2oxygen;

import static com.github.tomakehurst.wiremock.core.WireMockConfiguration.options;

import com.github.tomakehurst.wiremock.WireMockServer;

/**
 * Just for demonstration and testing purpose a wiremock standalone is started which delivers mocked REST methods and
 * acts as a file server with it's build in Jetty Server. Start this and go to <a href="http://localhost/index.html">http://localhost/index.html</a>.
 */
public class StartWireMockStandalone {

   public static void main(String[] args) {

      WireMockServer wireMockServer = new WireMockServer(options().port(80).withRootDirectory("src"));
      wireMockServer.start();
   }

}