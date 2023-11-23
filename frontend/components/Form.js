import React, { useState } from 'react';
import * as yup from 'yup';

const validationErrors = {
  fullNameTooShort: 'Full name must be at least 3 characters',
  fullNameTooLong: 'Full name must be at most 20 characters',
  sizeIncorrect: 'Size must be S or M or L',
};

const toppings = [
  { topping_id: '1', text: 'Pepperoni' },
  { topping_id: '2', text: 'Green Peppers' },
  { topping_id: '3', text: 'Pineapple' },
  { topping_id: '4', text: 'Mushrooms' },
  { topping_id: '5', text: 'Ham' },
];

const pizzaSchema = yup.object().shape({
  fullName: yup.string().min(3, validationErrors.fullNameTooShort).max(20, validationErrors.fullNameTooLong),
  size: yup.string().matches(/^[SML]$/, validationErrors.sizeIncorrect),
  toppings: yup.array().of(yup.string().oneOf(toppings.map(t => t.text))),
});

const Form = () => {
  const [formValues, setFormValues] = useState({
    fullName: '',
    size: '',
    toppings: [],
  });

  const [formErrors, setFormErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [failureMessage, setFailureMessage] = useState('');

  const handleChange = (evt) => {
    const { name, value, type, checked } = evt.target;
  
    if (type === 'checkbox') {
      const updatedToppings = handleCheckboxChange(formValues.toppings, value, checked);
  
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
  
    // Validate the entire form instead of individual fields
    pizzaSchema.validate(formValues).then(() => {
      setFormErrors({});
      setSuccessMessage('Form submitted successfully!');
    }).catch((error) => {
      setFormErrors(error.inner);
      setSuccessMessage('');
      setFailureMessage('Form submission failed.');
    });
  };
  
  const handleCheckboxChange = (toppings, topping, checked) => {
    return checked ? [...toppings, topping] : toppings.filter((t) => t !== topping);
  };
  

  const handleSubmit = (e) => {
    e.preventDefault();

    pizzaSchema.validate(formValues)
      .then(() => {
        // Simulate a successful form submission
        setSuccessMessage('Thank you for your order!');
        setFailureMessage('');
        console.log('Form submitted successfully!', formValues);
      })
      .catch((error) => {
        // Simulate a failed form submission
        setFailureMessage('Something went wrong');
        setSuccessMessage('');
        console.error('Form validation failed:', error);
      });
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Order Your Pizza</h2>
      {successMessage && <div className='success'>{successMessage}</div>}
      {failureMessage && <div className='failure'>{failureMessage}</div>}

      <div className="input-group">
        <div>
          <label htmlFor="fullName">Full Name</label><br />
          <input
            placeholder="Type full name"
            id="fullName"
            type="text"
            name="fullName"
            value={formValues.fullName}
            onChange={handleChange}
          />
        </div>
        {formErrors.fullName && <div className='error'>{formErrors.fullName}</div>}
      </div>

      <div className="input-group">
        <div>
          <label htmlFor="size">Size</label><br />
          <select
            id="size"
            name="size"
            value={formValues.size}
            onChange={handleChange}
          >
            <option value="">----Choose Size----</option>
            {['S', 'M', 'L'].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
        {formErrors.size && <div className='error'>{formErrors.size}</div>}
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
            {text}<br />
          </label>
        ))}
      </div>

      <input type="submit" disabled={Object.values(formErrors).some((error) => error !== '')} />
    </form>
  );
};

export default Form;
