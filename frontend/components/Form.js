import React, { useState, useEffect } from "react";
import * as yup from "yup";
import axios from "axios";

const validationErrors = {
  fullNameTooShort: "Full name must be at least 3 characters",
  fullNameTooLong: "Full name must be at most 20 characters",
  sizeIncorrect: "Size must be Small or Medium or Large",
};

const toppings = [
  { topping_id: "1", text: "Pepperoni" },
  { topping_id: "2", text: "Green Peppers" },
  { topping_id: "3", text: "Pineapple" },
  { topping_id: "4", text: "Mushrooms" },
  { topping_id: "5", text: "Ham" },
];

const pizzaSchema = yup.object().shape({
  fullName: yup
    .string()
    .min(3, validationErrors.fullNameTooShort)
    .max(20, validationErrors.fullNameTooLong)
    .required("Full name is required"),
  size: yup
    .string()
    .matches(/^[SML]$/, validationErrors.sizeIncorrect)
    .required("Size is required"),
  toppings: yup.array().of(yup.string().oneOf(toppings.map((t) => t.text))),
});

const Form = () => {
  const [formValues, setFormValues] = useState({
    fullName: "",
    size: "",
    toppings: [],
  });

  const [formErrors, setFormErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [failureMessage, setFailureMessage] = useState("");

  const handleChange = (evt) => {
    const { name, value, type, checked } = evt.target;

    if (type === "checkbox") {
      const updatedToppings = handleCheckboxChange(
        formValues.toppings,
        value,
        checked
      );

      setFormValues((prevValues) => ({
        ...prevValues,
        toppings: updatedToppings,
      }));
    } else {
      setFormValues((prevValues) => ({
        ...prevValues,
        [name]: value,
      }));
    }
  };

  const handleCheckboxChange = (toppings, topping, checked) => {
    return checked
      ? [...toppings, topping]
      : toppings.filter((t) => t !== topping);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await pizzaSchema.validate(formValues);

    // Extract topping names from the toppings array
    const toppingNames = formValues.toppings.filter(topping => topping !== null).map(topping => topping.text);

    // Create a new object with the extracted toppings
    const formData = {
      ...formValues,
      toppings: toppingNames,
    };

      // Send the form data to the API endpoint
      const response = await axios.post(
        "http://localhost:9009/api/order",
        formData
      );
      console.log(response.data);

      // Update the success message based on the response
      setSuccessMessage(response.data.message);
      setFailureMessage("");
      // Additional logic or side effects may be here
      console.log("Form submitted successfully!", formValues);

      // Clear the form values after a successful order
      setFormValues({
        fullName: "",
        size: "",
        toppings: [],
      });
    } catch (error) {
      // Simulate a failed form submission
      setFailureMessage("Something went wrong");
      setSuccessMessage("");

      const fieldErrors = {};

      // Handle errors for each field
      if (error.inner) {
        error.inner.forEach((err) => {
          fieldErrors[err.path] = err.message;
        });
      }

      setFormErrors(fieldErrors);
      console.error("Form validation failed:", error);
    }
  };

  // Use useEffect to log formValues after the state has been updated
  useEffect(() => {
    console.log("Form Values after state update:", formValues);
  }, [formValues]); // This dependency array ensures that useEffect runs when formValues changes

  return (
    <form onSubmit={handleSubmit}>
      <h2>Order Your Pizza</h2>
      {successMessage && <div className="success">{successMessage}</div>}
      {failureMessage && <div className="failure">{failureMessage}</div>}

      <div className="input-group">
        <div>
          <label htmlFor="fullName">Full Name</label>
          <br />
          <input
            placeholder="Type full name"
            id="fullName"
            type="text"
            name="fullName"
            value={formValues.fullName}
            onChange={handleChange}
          />
          {formErrors.fullName && (
            <div className="error">{formErrors.fullName}</div>
          )}
        </div>
      </div>

      <div className="input-group">
        <div>
          <label htmlFor="size">Size</label>
          <br />
          <select
            id="size"
            name="size"
            value={formValues.size}
            onChange={handleChange}
          >
            <option value="">----Choose Size----</option>
            {[
              { value: "S", label: "Small" },
              { value: "M", label: "Medium" },
              { value: "L", label: "Large" },
            ].map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          {formErrors.size && <div className="error">{formErrors.size}</div>}
        </div>
      </div>

      <div className="input-group">
        {toppings.map(({ topping_id, text }) => (
          <label key={topping_id}>
            <input
              name={text}
              type="checkbox"
              value={text}
              onChange={handleChange}
              checked={formValues.toppings.includes(text)}
            />
            {text}
            <br />
          </label>
        ))}
      </div>

      <input
        type="submit"
        disabled={
          Object.values(formErrors).some(
            (error) => error !== undefined && error !== ""
          ) ||
          formValues.fullName === "" ||
          formValues.size === ""
        }
      />
    </form>
  );
};

export default Form;
