/*
 * Copyright 2014 Cask, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

package co.cask.cdap.internal.app.runtime.service.http;

import co.cask.cdap.api.service.http.HttpServiceResponder;
import co.cask.http.HttpResponder;
import com.google.common.collect.ImmutableMultimap;
import com.google.common.collect.Multimap;
import com.google.gson.Gson;
import org.jboss.netty.buffer.ChannelBuffers;
import org.jboss.netty.handler.codec.http.HttpResponseStatus;

import java.lang.reflect.Type;
import java.nio.ByteBuffer;
import java.nio.charset.Charset;

/**
 * Implementation of {@link HttpServiceResponder} which binds the methods
 * to the appropriate methods for a {@link HttpResponder}.
 */
final class DefaultHttpServiceResponder implements HttpServiceResponder {

  private final HttpResponder responder;

  /**
   * Instantiates the class from a {@link HttpResponder}
   *
   * @param responder
   */
  DefaultHttpServiceResponder(HttpResponder responder) {
    this.responder = responder;
  }

  /**
   * Sends JSON response back to the client with status code 200 OK.
   *
   * @param object Object that will be serialized into JSON and sent back as content
   */
  @Override
  public void sendJson(Object object) {
    responder.sendJson(HttpResponseStatus.OK, object);
  }

  /**
   * Sends JSON response back to the client.
   *
   * @param status status of the HTTP response
   * @param object object that will be serialized into JSON and sent back as content
   */
  @Override
  public void sendJson(int status, Object object) {
    responder.sendJson(HttpResponseStatus.valueOf(status), object);
  }

   /**
    * Sends JSON response back to the client using the given {@link Gson} object.
    *
    * @param status status of the HTTP response
    * @param object object that will be serialized into JSON and sent back as content
    * @param type type of object
    * @param gson Gson object for serialization
   */
  @Override
  public void sendJson(int status, Object object, Type type, Gson gson) {
    responder.sendJson(HttpResponseStatus.valueOf(status), object, type, gson);
  }

  /**
   * Sends a UTF-8 encoded string response back to the http client with a default response status.
   *
   * @param data string data to be sent back
   */
  @Override
  public void sendString(String data) {
    responder.sendString(HttpResponseStatus.OK, data);
  }

  /**
   * Sends a string response back to the http client.
   *
   * @param status status of the HTTP response
   * @param data string data to be sent back
   * @param charset the Charset used to encode the string
   */
  @Override
  public void sendString(int status, String data, Charset charset) {
    responder.sendContent(HttpResponseStatus.valueOf(status), ChannelBuffers.wrappedBuffer(charset.encode(data)),
                          "text/plain; charset=" + charset.name(), ImmutableMultimap.<String, String>of());
  }

  /**
   * Sends only a status code back to client without any content.
   *
   * @param status status of the HTTP response
   */
  @Override
  public void sendStatus(int status) {
    responder.sendStatus(HttpResponseStatus.valueOf(status));
  }

  /**
   * Sends a status code and headers back to client without any content.
   *
   * @param status status of the HTTP response
   * @param headers headers to send
   */
  @Override
  public void sendStatus(int status, Multimap<String, String> headers) {
    responder.sendStatus(HttpResponseStatus.valueOf(status), headers);
  }

  /**
   * Sends error message back to the client with the specified status code.
   *
   * @param status status of the response
   * @param errorMessage error message sent back to the client
   */
  @Override
  public void sendError(int status, String errorMessage) {
    responder.sendError(HttpResponseStatus.valueOf(status), errorMessage);
  }

  /**
   * Sends response back to client.
   *
   * @param status status of the response
   * @param content content to be sent back
   * @param contentType type of content
   * @param headers headers to be sent back
   */
  @Override
  public void send(int status, ByteBuffer content, String contentType, Multimap<String, String> headers) {
    responder.sendContent(HttpResponseStatus.valueOf(status),
                          ChannelBuffers.wrappedBuffer(content), contentType, headers);
  }
}
