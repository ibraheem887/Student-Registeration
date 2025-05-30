// Function to show/hide sections
function showSection(sectionId) {
  // Hide all sections
  document.querySelectorAll('.management-section').forEach(section => {
    section.style.display = 'none';
  });

  // Show the selected section
  document.getElementById(sectionId).style.display = 'block';
}

// Add Course
document.getElementById('addCourseForm').addEventListener('submit', function (e) {
  e.preventDefault();
  const courseData = {
    courseCode: document.getElementById('courseCode').value,
    courseName: document.getElementById('courseName').value,
    department: document.getElementById('department').value,
    schedule: {
      days: document.getElementById('days').value.split(','),
      startTime: document.getElementById('startTime').value,
      endTime: document.getElementById('endTime').value,
    },
    seats: parseInt(document.getElementById('seats').value),
    prerequisites: document.getElementById('prerequisites').value.split(','),
  };

  // Validate inputs
  if (
    !courseData.courseCode ||
    !courseData.courseName ||
    !courseData.department ||
    !courseData.schedule.days ||
    !courseData.schedule.startTime ||
    !courseData.schedule.endTime ||
    isNaN(courseData.seats)
  ) {
    alert('Please fill in all fields correctly.');
    return;
  }

  fetch('/api/admin/courses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(courseData),
  })
    .then(response => {
      if (!response.ok) {
        return response.json().then(err => {
          throw new Error(err.message || 'Failed to add course.');
        });
      }
      return response.json();
    })
    .then(data => {
      alert('Course added successfully!');
      document.getElementById('addCourseForm').reset();
    })
    .catch(error => {
      console.error('Error:', error);
      alert(error.message || 'Failed to add course. Please try again.');
    });
});

// Delete Course
document.getElementById('deleteCourseForm').addEventListener('submit', function (e) {
  e.preventDefault();
  const courseCode = document.getElementById('deleteCourseCode').value;

  // Validate input
  if (!courseCode) {
    alert('Please enter a Course Code.');
    return;
  }

  fetch(`/api/admin/courses/${courseCode}`, {
    method: 'DELETE',
  })
    .then(response => {
      if (!response.ok) {
        return response.json().then(err => {
          throw new Error(err.message || 'Failed to delete course.');
        });
      }
      return response.json();
    })
    .then(data => {
      alert('Course deleted successfully!');
      document.getElementById('deleteCourseForm').reset();
    })
    .catch(error => {
      console.error('Error:', error);
      alert(error.message || 'Failed to delete course. Please try again.');
    });
});

// Update Course
document.getElementById('updateCourseForm').addEventListener('submit', function (e) {
  e.preventDefault();

  // Get the course code
  const courseCode = document.getElementById('updateCourseCode').value;

  // Validate course code
  if (!courseCode) {
    alert('Course Code is required.');
    return;
  }

  // Build the updates object dynamically
  const updates = {};
  const courseName = document.getElementById('updateCourseName').value;
  const department = document.getElementById('updateDepartment').value;
  const days = document.getElementById('updateDays').value;
  const startTime = document.getElementById('updateStartTime').value;
  const endTime = document.getElementById('updateEndTime').value;
  const seats = document.getElementById('updateSeats').value;
  const prerequisites = document.getElementById('updatePrerequisites').value;

  if (courseName) {
    updates.courseName = courseName;
  }
  if (department) {
    updates.department = department;
  }
  if (days) {
    updates.days = days.split(',').map(day => day.trim()); // Convert to array and trim whitespace
  }
  if (startTime) {
    updates.startTime = startTime;
  }
  if (endTime) {
    updates.endTime = endTime;
  }
  if (seats) {
    updates.seats = parseInt(seats);
    if (isNaN(updates.seats)) {
      alert('Seats must be a valid number.');
      return;
    }
  }
  if (prerequisites) {
    updates.prerequisites = prerequisites.split(',').map(prereq => prereq.trim()); // Convert to array and trim whitespace
  }

  // Check if at least one field is provided
  if (Object.keys(updates).length === 0) {
    alert('Please fill in at least one field to update.');
    return;
  }

  // Send the update request
  fetch(`/api/admin/courses/${courseCode}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  })
    .then(response => {
      if (!response.ok) {
        return response.json().then(err => {
          throw new Error(err.message || 'Failed to update course.');
        });
      }
      return response.json();
    })
    .then(data => {
      alert('Course updated successfully!');
      document.getElementById('updateCourseForm').reset(); // Reset the form
    })
    .catch(error => {
      console.error('Error:', error);
      alert(error.message || 'Failed to update course. Please try again.');
    });
});

// Override Registration
document.getElementById('overrideRegistrationForm').addEventListener('submit', function (e) {
  e.preventDefault();
  const courseCode = document.getElementById('courseId').value;
  const rollNumber = document.getElementById('studentId').value;

  // Validate inputs
  if (!courseCode || !rollNumber) {
    alert('Please fill in both Course Code and Roll Number.');
    return;
  }

  fetch(`/api/admin/courses/${courseCode}/override/${rollNumber}`, {
    method: 'POST',
  })
    .then(response => {
      if (!response.ok) {
        return response.json().then(err => {
          throw new Error(err.message || 'Failed to override registration.');
        });
      }
      return response.json();
    })
    .then(data => {
      alert('Student added to course successfully!');
      document.getElementById('overrideRegistrationForm').reset();
    })
    .catch(error => {
      console.error('Error:', error);
      alert(error.message || 'Failed to override registration. Please try again.');
    });
});

// Adjust Seats
document.getElementById('adjustSeatsForm').addEventListener('submit', function (e) {
  e.preventDefault();
  const courseCode = document.getElementById('courseIdSeats').value;
  const seats = parseInt(document.getElementById('newSeats').value);

  // Validate inputs
  if (!courseCode || isNaN(seats) || seats < 0) {
    alert('Please enter a valid Course Code and number of seats.');
    return;
  }

  fetch(`/api/admin/courses/${courseCode}/seats`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ seats }),
  })
    .then(response => {
      if (!response.ok) {
        return response.json().then(err => {
          throw new Error(err.message || 'Failed to adjust seats.');
        });
      }
      return response.json();
    })
    .then(data => {
      alert('Seats adjusted successfully!');
      document.getElementById('adjustSeatsForm').reset();
    })
    .catch(error => {
      console.error('Error:', error);
      alert(error.message || 'Failed to adjust seats. Please try again.');
    });
});

// Generate Reports
document.getElementById('generateReports').addEventListener('click', function () {
  const courseCode = prompt('Enter Course Code to generate report:');
  if (!courseCode) return;

  fetch(`/api/admin/reports?courseCode=${courseCode}`)
    .then(response => {
      console.log('Response:', response);
      if (!response.ok) {
        return response.json().then(err => {
          throw new Error(err.message || 'Failed to generate reports.');
        });
      }
      return response.json();
    })
    .then(data => {
      console.log('Data:', data);
      const reportsOutput = document.getElementById('reportsOutput');

      // Clear previous content
      reportsOutput.innerHTML = '';

      // Display Students in Course
      if (data.studentsInCourse && data.studentsInCourse.length > 0) {
        reportsOutput.innerHTML += `<h3>Students in Course:</h3>`;
        reportsOutput.innerHTML += generateTable(data.studentsInCourse, ['name', 'rollNumber', 'email']);
      } else {
        reportsOutput.innerHTML += `<h3>Students in Course:</h3><p>No students enrolled in this course.</p>`;
      }

      // Display Courses with Available Seats
      if (data.coursesWithSeats && data.coursesWithSeats.length > 0) {
        reportsOutput.innerHTML += `<h3>Courses with Available Seats:</h3>`;
        reportsOutput.innerHTML += generateTable(data.coursesWithSeats, ['courseCode', 'courseName', 'seats']);
      } else {
        reportsOutput.innerHTML += `<h3>Courses with Available Seats:</h3><p>No courses with available seats.</p>`;
      }

      // Display Students Without Prerequisites
      if (data.studentsWithoutPrerequisites && data.studentsWithoutPrerequisites.length > 0) {
        reportsOutput.innerHTML += `<h3>Students Without Prerequisites:</h3>`;
        reportsOutput.innerHTML += generateTable(data.studentsWithoutPrerequisites, ['name', 'rollNumber', 'email']);
      } else {
        reportsOutput.innerHTML += `<h3>Students Without Prerequisites:</h3><p>All students meet the prerequisites.</p>`;
      }
    })
    .catch(error => {
      console.error('Error:', error);
      alert(error.message || 'Failed to generate reports. Please try again.');
    });
});

// Helper function to generate HTML tables
function generateTable(data, columns) {
  if (!data || data.length === 0) return '<p>No data available.</p>';

  let table = `<table border="1" cellpadding="10" cellspacing="0" style="width: 100%; margin-bottom: 20px;">`;

  // Table Header
  table += `<thead><tr>`;
  columns.forEach(column => {
    table += `<th>${column}</th>`;
  });
  table += `</tr></thead>`;

  // Table Body
  table += `<tbody>`;
  data.forEach(item => {
    table += `<tr>`;
    columns.forEach(column => {
      table += `<td>${item[column] || 'N/A'}</td>`;
    });
    table += `</tr>`;
  });
  table += `</tbody></table>`;

  return table;
}


// Function to fetch and display student registrations
async function fetchStudentRegistrations() {
  try {
    const response = await fetch('/api/admin/student-registrations', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch student registrations.');
    }

    const data = await response.json();
    renderStudentRegistrations(data);
  } catch (error) {
    console.error('Error fetching student registrations:', error);
    alert('Failed to fetch student registrations. Please try again.');
  }
}

// Function to render student registrations
function renderStudentRegistrations(registrations) {
  const studentRegistrationsList = document.getElementById('studentRegistrationsList');
  studentRegistrationsList.innerHTML = ''; // Clear the list

  if (registrations.length === 0) {
    studentRegistrationsList.innerHTML = '<p>No student registrations found.</p>';
    return;
  }

  registrations.forEach(student => {
    const studentItem = document.createElement('div');
    studentItem.className = 'student-item';
    studentItem.innerHTML = `
      <h3>${student.name} (${student.rollNumber})</h3>
     
      <h4>Enrolled Courses:</h4>
      <ul>
        ${student.courses.map(course => `
          <li> (${course.courseCode})</li>
        `).join('')}
      </ul>
    `;
    studentRegistrationsList.appendChild(studentItem);
  });
}

// Add a link to the navbar for the admin section


