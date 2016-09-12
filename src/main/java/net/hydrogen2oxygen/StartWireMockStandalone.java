package net.hydrogen2oxygen;

import static com.github.tomakehurst.wiremock.core.WireMockConfiguration.options;

import com.github.tomakehurst.wiremock.WireMockServer;

public class StartWireMockStandalone {

   public static void main(String[] args) {

      // Just to test the REST interface between a Server and the map-designer library

      WireMockServer wireMockServer = new WireMockServer(options().port(80).withRootDirectory("src/test/resources/wiremock"));
      wireMockServer.start();
   }

}
