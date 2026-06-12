# Beginner Explanatory Guide: SVC-1972: Fix Webhook Delivery Reliability

> **Task Type**: Service Task  
> **Domain/Focus**: Webhook Delivery Reliability in JavaScript (Node.js)

---

## 1. The Goal (In-Depth Beginner Explanation)

### The Core Problem
In the context of our application, the current implementation of the webhook delivery system is unreliable. When the endpoint (the URL where we send our webhook) returns a server error (specifically a 5xx error), the system fails to handle this situation properly. Instead of retrying the delivery of the webhook, it simply logs the failure and moves on, which means that important events can be lost without any notification to the user or the system. This is particularly problematic because webhooks are often used for critical integrations, such as payment processing or notifications, where missing an event can lead to significant issues.

Fixing this problem is crucial for maintaining the integrity and reliability of the system. Users expect that when they send data via webhooks, it will be delivered successfully, even in the face of temporary server issues. By implementing a retry mechanism with exponential backoff, we can ensure that the system attempts to resend the webhook a few times before giving up, thus increasing the chances of successful delivery. Additionally, adding signature verification will enhance security by ensuring that the payload has not been tampered with.

### Jargon Buster (Key Terms Explained)
* **Webhook**: A webhook is a way for an application to provide real-time information to other applications. It sends data to a specified URL when certain events occur. For example, when a user makes a purchase, a webhook can notify the inventory system to update stock levels.
  
* **5xx Error**: This is a category of HTTP status codes that indicate server errors. When a server returns a 5xx error, it means that something has gone wrong on the server side, preventing it from fulfilling the request. For example, a 500 Internal Server Error indicates that the server encountered an unexpected condition.

* **Exponential Backoff**: This is a standard error-handling strategy for network applications in which the wait time between retries increases exponentially. For instance, if the first retry waits 1 second, the second might wait 2 seconds, the third 4 seconds, and so on. This approach helps to reduce the load on the server and increases the likelihood of a successful request.

* **HMAC-SHA256**: HMAC (Hash-based Message Authentication Code) is a mechanism that combines a cryptographic hash function (like SHA256) with a secret key to ensure data integrity and authenticity. It is used to verify that the message has not been altered and comes from a trusted source.

### Expected Outcome
After implementing the necessary fixes, the webhook delivery system should behave as follows:

**Before**: When a webhook delivery fails due to a 5xx error, the system logs the failure and does not attempt to resend the webhook. This can lead to lost events and a lack of reliability in the system.

**After**: When a webhook delivery fails due to a 5xx error, the system will automatically retry the delivery up to three times, using exponential backoff between attempts. Additionally, each webhook will include a signature in the headers to verify its authenticity. This ensures that events are delivered reliably and securely.

---

## 2. Related Coding Concepts & Syntax (50% Theory, 50% Practice)

### Concept 1: Asynchronous Programming in JavaScript
#### 📘 Theoretical Overview (50%)
* **Why it exists**: Asynchronous programming allows JavaScript to perform tasks like network requests without blocking the execution of other code. This is crucial for web applications, where waiting for a server response could freeze the user interface. Without asynchronous programming, users would experience delays and unresponsive applications.

* **Key Mechanisms**: JavaScript uses callbacks, promises, and async/await syntax to handle asynchronous operations. Callbacks are functions passed as arguments to other functions, which are executed after a task completes. Promises represent a value that may be available now, or in the future, or never. The async/await syntax allows developers to write asynchronous code that looks synchronous, making it easier to read and maintain.

#### 💻 Syntax & Practical Examples (50%)
* **Language Syntax**:
  ```javascript
  // Using a Promise
  const fetchData = () => {
      return new Promise((resolve, reject) => {
          // Simulate an asynchronous operation
          setTimeout(() => {
              const data = "Data received";
              resolve(data); // Successfully resolved
          }, 1000);
      });
  };

  // Using async/await
  const getData = async () => {
      try {
          const result = await fetchData();
          console.log(result); // Logs "Data received"
      } catch (error) {
          console.error("Error:", error);
      }
  };

  getData(); // Call the async function
  ```

* **Real-World Application**:
  ```javascript
  // Example of making an HTTP request
  const axios = require('axios');

  const deliverWebhook = async (url, payload) => {
      try {
          const response = await axios.post(url, payload);
          console.log("Webhook delivered:", response.data);
      } catch (error) {
          console.error("Delivery failed:", error.message);
      }
  };

  deliverWebhook("https://example.com/webhook", { event: "purchase" });
  ```

---

## 3. Step-by-Step Logic & Walkthrough

1. **Step 1: Locate and Analyze the Target File**
   * Navigate to the `s-w08-hotfix-02` folder and open the `webhookDelivery.js` file. This file contains the implementation of the webhook delivery system.
   * Focus on the `deliver` method, which is responsible for sending the webhook to the subscribed URLs. Look for the `try...catch` block where the delivery logic is currently implemented.

2. **Step 2: Input Verification & Validation**
   * Before making any changes, ensure that the `event` and `payload` parameters passed to the `deliver` method are valid. Check if they are not null or undefined. This can prevent unnecessary errors during execution.

3. **Step 3: Core Implementation / Modification**
   * Implement the retry logic within the `catch` block of the `deliver` method. Use a loop to attempt the delivery up to three times, with exponential backoff between attempts. You can use `setTimeout` to create the delay.
   * Add the HMAC-SHA256 signature to the headers before making the HTTP request. This will require importing a library for HMAC generation, such as `crypto`.

4. **Step 4: Output Verification & Testing**
   * After implementing the changes, run the tests included at the bottom of the `webhookDelivery.js` file. Ensure that the tests cover both successful deliveries and scenarios where the endpoint returns a 5xx error. Verify that the delivery log reflects the correct status for each attempt.

---

## 4. Detailed Walkthrough of Test Cases

### Test Case 1: Standard / Success Case
* **Description**: This test represents a scenario where the webhook delivery is successful on the first attempt.
* **Inputs**:
  ```json
  {
      "event": "purchase",
      "payload": {
          "item": "book",
          "price": 20
      }
  }
  ```
* **Step-by-Step Execution Trace**:
  1. The `deliver` method receives the event "purchase" and the payload containing item details.
  2. The method retrieves the subscriptions for the "purchase" event.
  3. It attempts to send the payload to the subscribed URL using `httpPost`.
  4. The delivery is successful, and the status is logged as "delivered".
* **Expected Output**: The delivery log should contain an entry indicating that the webhook was delivered successfully.

### Test Case 2: Edge Case / Validation Fail
* **Description**: This test represents a scenario where the webhook delivery fails due to a 5xx error from the endpoint.
* **Inputs**:
  ```json
  {
      "event": "purchase",
      "payload": {
          "item": "book",
          "price": 20
      }
  }
  ```
* **Step-by-Step Execution Trace**:
  1. The `deliver` method receives the event "purchase" and the payload.
  2. The method retrieves the subscriptions for the "purchase" event.
  3. It attempts to send the payload to the subscribed URL using `httpPost`, which simulates a 5xx error.
  4. The catch block is triggered, and the method retries the delivery up to three times, each time logging the failure.
  5. After three failed attempts, the final status is logged as "failed".
* **Expected Output**: The delivery log should contain three entries indicating failed attempts, along with the error messages from each attempt.