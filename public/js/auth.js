// Switch between Student and Admin Login Forms
document.getElementById('switchToAdmin').addEventListener('click', function (e) {
  e.preventDefault();
  document.getElementById('studentLoginBox').style.display = 'none';
  document.getElementById('adminLoginBox').style.display = 'block';
});

document.getElementById('switchToStudent').addEventListener('click', function (e) {
  e.preventDefault();
  document.getElementById('adminLoginBox').style.display = 'none';
  document.getElementById('studentLoginBox').style.display = 'block';
});

// Student Login Form Submission
document.getElementById('studentLoginForm').addEventListener('submit', function (e) {
  e.preventDefault();
  const rollNumber = document.getElementById('rollNumber').value;

  if (rollNumber.trim() === "") {
    alert("Please enter your roll number.");
    return;
  }

  fetch('http://localhost:5500/api/auth/student-login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ rollNumber }),
  })
    .then(response => {
      console.log('Login response:', response); // Debugging
      return response.json();
    })
    .then(data => {
      console.log('Login data:', data);
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('rollNumber', data.student.rollNumber);
        
        window.location.href = "http://localhost:5500/student-dashboard";
      } else {
        alert('Login failed: ' + data.message);
      }
    })
    .catch(error => {
      console.error('Error:', error);
      alert('An error occurred. Please try again.');
    });
});

// Admin Login Form Submission
document.getElementById('adminLoginForm').addEventListener('submit', function (e) {
  e.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  if (username.trim() === "" || password.trim() === "") {
    alert("Please enter both username and password.");
    return;
  }

  fetch('http://localhost:5500/api/auth/admin-login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  })
    .then(response => response.json())
    .then(data => {
      if (data.token) {
        localStorage.setItem('token', data.token);
        window.location.href = "http://localhost:5500/admin-dashboard";
      } else {
        alert('Login failed: ' + data.message);
      }
    })
    .catch(error => {
      console.error('Error:', error);
      alert('An error occurred. Please try again.');
    });
});
