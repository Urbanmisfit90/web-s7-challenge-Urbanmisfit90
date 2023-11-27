import React, { useState, useEffect } from "react";
import * as yup from "yup";
import axios from "axios";

const validationErrors = {
  fullNameTooShort: 'full name must be at least 3 characters',
  fullNameTooLong: 'full name must be at most 20 characters',
  sizeIncorrect: 'size must be S or M or L',
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
    .trim()
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

  const [formErrors, setFormErrors] = useState({});
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
      setFormValues((prevValues) => ({
        ...prevValues,
        [name]: value,
      }));
      yup
        .reach(pizzaSchema, name)
        .validate(value)
        .then(() => {
          // If value is valid, the corresponding error message will be deleted
          setFormErrors({ ...formErrors, [name]: "" });
        })
        .catch((err) => {
          // If invalid, we update the error message with the text returned by Yup
          // This error message was hard-coded in the schema
          setFormErrors({ ...formErrors, [name]: err.errors[0] });
        });
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
              value={topping_id}
              onChange={handleChange}
              checked={formValues.toppings.includes(topping_id)}
            />
            {text}
            <br />
          </label>
        ))}
      </div>

      <input type="submit" disabled={!isFormValid} />
    </form>
  );
};

export default Form;