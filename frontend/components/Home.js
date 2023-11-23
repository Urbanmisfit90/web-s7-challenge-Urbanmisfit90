import React from 'react'
import { useNavigate } from 'react-router-dom'
import pizza from './images/pizza.jpg'

function Home() {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate.push('/order');
  };

  return (
    <div>
      <h2>Welcome to Bloom Pizza!</h2>
      {/* Clicking on the img should navigate to "/order" */}
      <img
        alt="order-pizza"
        style={{ cursor: 'pointer' }}
        src={pizza}
        onClick={handleClick}
      />
    </div>
  );
}

export default Home
