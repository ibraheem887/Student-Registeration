document.addEventListener('DOMContentLoaded', function () {
  const calendarEl = document.getElementById('calendar');
  const registeredCourseList = document.getElementById('registeredCourseList');
  const availableCourseList = document.getElementById('availableCourseList');
  const prerequisiteInfo = document.getElementById('prerequisiteInfo');
  const filterForm = document.getElementById('filterForm');

  const calendarSection = document.getElementById('calendar');
  const registeredCoursesSection = document.getElementById('registeredCourses');
  const availableCoursesSection = document.getElementById('availableCourses');

  // Function to show a specific section and hide others
  window.showSection = function (sectionId) {
    // Hide all sections
    calendarSection.classList.add('hidden');
    registeredCoursesSection.classList.add('hidden');
    availableCoursesSection.classList.add('hidden');

    // Show the selected section
    if (sectionId === 'calendar') {
      calendarSection.classList.remove('hidden');
    } else if (sectionId === 'registeredCourses') {
      registeredCoursesSection.classList.remove('hidden');
    } else if (sectionId === 'availableCourses') {
      availableCoursesSection.classList.remove('hidden');
    }
  };

  // Default: Show the Calendar section
  showSection('calendar');

  // Fetch and display enrolled courses
  fetchEnrolledCourses();

  // Fetch and display available courses
  fetchCourses();

  // Enroll in a course
  window.enrollCourse = async function (courseCode) {
    try {
      const rollNumber = localStorage.getItem('rollNumber');
      const response = await fetch('http://localhost:5500/api/student/register-course', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ courseCode, rollNumber }),
      });

      const data = await response.json();
      if (data.message) {
        alert(data.message); // Show success message
        fetchEnrolledCourses(); // Refresh the enrolled courses list
        fetchCourses(); // Refresh the available courses list
      } else {
        alert('Enrollment failed: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error enrolling in course:', error);
      alert('An error occurred. Please try again.');
    }
  };

  // Filter courses
  filterForm.addEventListener('submit', function (e) {
    e.preventDefault();

    // Capture filter values
    const filters = {
      department: document.getElementById('department').value,
      seats: document.getElementById('seats').value,
      prerequisites: document.getElementById('prerequisites').value,
      time: document.getElementById('time').value,
    };

    // Fetch courses with filters
    fetchCourses(filters);
  });

  // Fetch available courses from the server
  async function fetchCourses(filters = {}) {
    try {
      // Convert filters to query parameters
      const queryParams = new URLSearchParams();
      for (const key in filters) {
        if (filters[key]) queryParams.append(key, filters[key]);
      }

      // Retrieve the token from localStorage
      const token = localStorage.getItem('token');

      // Send the request with the token in the Authorization header
      const response = await fetch(`http://localhost:5500/api/student/courses?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch courses');

      const data = await response.json();
      if (data.length > 0) {
        renderAvailableCourses(data); // Render the available courses
      } else {
        availableCourseList.innerHTML = '<p>No courses found.</p>';
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      availableCourseList.innerHTML = '<p>Failed to fetch courses. Please try again.</p>';
    }
  }

  // Render available courses in the course list
  function renderAvailableCourses(courses) {
    availableCourseList.innerHTML = ''; // Clear the list
    courses.forEach(course => {
      const courseItem = document.createElement('div');
      courseItem.className = 'course-item';
      courseItem.innerHTML = `
        <h3>${course.courseName} (${course.courseCode})</h3>
        <p>Department: ${course.department}</p>
        <p>Schedule: ${course.schedule.days.join(', ')} ${course.schedule.startTime} - ${course.schedule.endTime}</p>
        <p>Seats: ${course.seats}</p>
        <p>Prerequisites: ${course.prerequisites.join(', ')}</p>
        <button onclick="enrollCourse('${course.courseCode}')">Enroll</button>
      `;
      availableCourseList.appendChild(courseItem);
    });
  }

  // Render registered courses in the course list
  function renderRegisteredCourses(courses) {
    registeredCourseList.innerHTML = ''; // Clear the list
    courses.forEach(course => {
      const courseItem = document.createElement('div');
      courseItem.className = 'course-item';
      courseItem.innerHTML = `
        <h3>${course.courseName} (${course.courseCode})</h3>
        <p>Department: ${course.department}</p>
        <p>Schedule: ${course.schedule.days.join(', ')} ${course.schedule.startTime} - ${course.schedule.endTime}</p>
        <p>Seats: ${course.seats}</p>
        <p>Prerequisites: ${course.prerequisites.join(', ')}</p>
        <button class="drop-course-btn" data-course-code="${course.courseCode}">Drop Course</button>
      `;
      registeredCourseList.appendChild(courseItem);
    });

    // Add event listeners to all drop buttons
    const dropButtons = document.querySelectorAll('.drop-course-btn');
    dropButtons.forEach(button => {
      button.addEventListener('click', function () {
        const courseCode = this.getAttribute('data-course-code');
        dropCourse(courseCode);
      });
    });
  }

  // Function to handle dropping a course
  function dropCourse(courseCode) {
    const confirmation = confirm(`Are you sure you want to drop ${courseCode}?`);
    if (!confirmation) return;

    const rollNumber = localStorage.getItem('rollNumber'); // Get the student's roll number from localStorage
    console.log('Dropping course with code:', courseCode);
    console.log('Student rollNumber:', rollNumber);

    fetch(`/api/student/drop-course`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ courseCode, rollNumber }),
    })
      .then(response => {
        if (!response.ok) {
          return response.json().then(err => {
            throw new Error(err.message || 'Failed to drop course.');
          });
        }
        return response.json();
      })
      .then(data => {
        alert(data.message || 'Course dropped successfully!');
        fetchEnrolledCourses(); // Refresh the list of registered courses
      })
      .catch(error => {
        console.error('Error:', error);
        alert(error.message || 'Failed to drop course. Please try again.');
      });
  }

  // Update the calendar with enrolled courses
  function updateCalendar(courses) {
    calendarEl.innerHTML = ''; // Clear the calendar

    // Create a table for the timetable
    const timetable = document.createElement('table');
    timetable.className = 'timetable';
    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');

    // Create table headers
    const headers = ['Time', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const headerRow = document.createElement('tr');
    headers.forEach(header => {
      const th = document.createElement('th');
      th.textContent = header;
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    timetable.appendChild(thead);

    // Create time slots dynamically based on course schedules
    const timeSlots = new Set();
    courses.forEach(course => {
      const startTime = convertToAMPM(course.schedule.startTime);
      const endTime = convertToAMPM(course.schedule.endTime);
      timeSlots.add(`${startTime} - ${endTime}`);
    });

    // Convert the Set to an array and sort it
    const sortedTimeSlots = Array.from(timeSlots).sort((a, b) => {
      const timeA = a.split(' - ')[0];
      const timeB = b.split(' - ')[0];
      return new Date(`1970/01/01 ${timeA}`) - new Date(`1970/01/01 ${timeB}`);
    });

    // Populate the timetable with time slots
    sortedTimeSlots.forEach(time => {
      const row = document.createElement('tr');
      const timeCell = document.createElement('td');
      timeCell.textContent = time;
      timeCell.style.whiteSpace = 'nowrap'; // Prevent line breaks in time slots
      row.appendChild(timeCell);

      // Add empty cells for each day
      for (let i = 0; i < 7; i++) {
        const dayCell = document.createElement('td');
        row.appendChild(dayCell);
      }

      tbody.appendChild(row);
    });

    timetable.appendChild(tbody);
    calendarEl.appendChild(timetable);

    // Populate the timetable with enrolled courses
    courses.forEach(course => {
      const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      const startTime = convertToAMPM(course.schedule.startTime);
      const endTime = convertToAMPM(course.schedule.endTime);
      const timeSlot = `${startTime} - ${endTime}`;

      // Find the row index for the time slot
      const rowIndex = sortedTimeSlots.indexOf(timeSlot);
      if (rowIndex !== -1) {
        // Loop through all days in the course schedule
        course.schedule.days.forEach(day => {
          // Map abbreviated day names to full names
          const dayMap = {
            'Mon': 'Monday',
            'Tue': 'Tuesday',
            'Wed': 'Wednesday',
            'Thu': 'Thursday',
            'Fri': 'Friday',
            'Sat': 'Saturday',
            'Sun': 'Sunday',
          };

          const fullDay = dayMap[day] || day; // Handle both abbreviated and full day names
          const dayIndex = daysOfWeek.indexOf(fullDay);

          if (dayIndex !== -1) {
            const row = tbody.children[rowIndex];
            if (row) {
              const dayCell = row.children[dayIndex + 1]; // +1 to skip the time cell
              dayCell.innerHTML = `
                <div class="event">
                  <strong>${course.courseName}</strong>
                  <p>${startTime} - ${endTime}</p>
                </div>
              `;
            }
          }
        });
      }
    });
  }

  // Helper function to convert HH:mm to HH:mm AM/PM
  function convertToAMPM(time) {
    const [hours, minutes] = time.split(':');
    let period = 'AM';
    let hour = parseInt(hours);

    if (hour >= 12) {
      period = 'PM';
      if (hour > 12) hour -= 12;
    }

    return `${hour}:${minutes} ${period}`;
  }

  // Fetch enrolled courses from the server
  async function fetchEnrolledCourses() {
    try {
      const response = await fetch('http://localhost:5500/api/student/enrolled-courses', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      renderRegisteredCourses(data); // Render the registered courses
      updateCalendar(data); // Update the calendar with enrolled courses
    } catch (error) {
      console.error('Error fetching enrolled courses:', error);
      alert('Failed to fetch enrolled courses. Please try again.');
    }
  }
});