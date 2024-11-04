import React from 'react'

const Navbar = () => {
  return (
    <div style={{
      position: "sticky", // Changed from "sticky" to "fixed"
      top: 0,           // Stick to the top
      left: 0,          // Align to the left
      right: 0,         // Stretch across the full width
      padding: "1rem",  // Add some padding
      backgroundColor: "#ffffff", // Add background color
      zIndex: 1000,     // Ensure navbar stays on top of other content
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)" // Optional: adds subtle shadow
    }}>
      Sticky Navbar
    </div>
  )
}

export default Navbar