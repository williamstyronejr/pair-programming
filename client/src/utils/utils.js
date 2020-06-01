import axios from 'axios';

/**
 * Sends an Ajax request using axios and returns a promise to resolve or reject
 *  with the server's response.
 * @param {String} url Url to send request to
 * @param {String} method Method to use for request
 * @param {Object} data Data to send with request
 * @param {Object} option Additional options
 * @return {Promise<Object>} Returns a promise to resolve or reject with
 *  the server's response.
 */
export function ajaxRequest(url, method = 'GET', data = {}, options = null) {
  return axios({
    url,
    method,
    data,
    ...options,
  });
}
