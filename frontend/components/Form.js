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
    .oneOf(["S", "M", "L"], validationErrors.sizeIncorrect)
    .required("Size is required"),
});

const Form = () => {
  const [formValues, setFormValues] = useState({
    fullName: "",
    size: "",
    toppings: [],
  });

  const [formErrors, setFormErrors] = useState({
    fullName: "",
    size: "",
  });
  const [successMessage, setSuccessMessage] = useState("");
  const [failureMessage, setFailureMessage] = useState("");
  const [isFormValid, setIsFormValid] = useState(false);

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
      yup
        .reach(pizzaSchema, name)
        .validate(value)
        .then(() => {
          // If value is valid, the corresponding error message will be deleted
          setFormErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
        })
        .catch((err) => {
          // If invalid, we update the error message with the text returned by Yup
          // This error message was hard-coded in the schema
          setFormErrors((prevErrors) => ({
            ...prevErrors,
            [name]: err.errors[0],
          }));
        });

      // Update the form values
      setFormValues((prevValues) => ({
        ...prevValues,
        [name]: value,
      }));

      // Additional validation for the 'size' field
      if (name === "size") {
        yup
          .reach(pizzaSchema, name)
          .validate(value)
          .then(() => {
            // If value is valid, the corresponding error message will be deleted
            setFormErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
          })
          .catch((err) => {
            // If invalid, we update the error message with the text returned by Yup
            // This error message was hard-coded in the schema
            setFormErrors((prevErrors) => ({
              ...prevErrors,
              [name]: err.errors[0],
            }));
          });
      }
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

      const formData = {
        ...formValues,
      };

      const response = await axios.post(
        "http://localhost:9009/api/order",
        formData
      );

      setSuccessMessage(response.data.message);
      setFailureMessage("");

      setFormValues({
        fullName: "",
        size: "",
        toppings: [],
      });
    } catch (error) {
      setFailureMessage("Something went wrong");
      setSuccessMessage("");
    }
  };

  // Use useEffect to log formValues after the state has been updated
  useEffect(() => {
    pizzaSchema.isValid(formValues).then((isValid) => {
      setIsFormValid(isValid);
    });
  }, [formValues]);

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
            {["S", "M", "L"].map((value) => (
              <option key={value} value={value}>
                {value}
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
              value={topping_id}
              onChange={handleChange}
              checked={formValues.toppings.includes(topping_id)}
            />
            {text}
            <br />
          </label>
        ))}
      </div>

      <input
        type="submit"
        disabled={!isFormValid || !!formErrors.fullName || !!formErrors.size}
      />
    </form>
  );
};

export default Form;
