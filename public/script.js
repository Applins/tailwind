// TODO: Wire up the app's behavior here.
const logItems = jql('ul[data-cy="logs"] li');
const courseSelector = jql('#course');
const logs = jql('#logs');
const items = jql('#logs > li');
const uvuIdInput = jql('#uvuId');
const addLogBtn = jql('button[data-cy="add_log_btn"]');
const logTextarea = jql('textarea[data-cy="log_textarea"]');

const courseUrl = './courses';
const logUrl = './logs';

function jql(sel) {
  let elements = document.querySelectorAll(sel);

  // Add methods to the elements object
  return {
    css: function (prop, value) {
      elements.forEach((el) => {
        el.style[prop] = value;
      });
    },
    append: function (child) {
      elements.forEach((el) => {
        el.appendChild(child);
      });
    },
    empty: function () {
      elements.forEach((el) => {
        el.innerHTML = '';
      });
    },
    on: function (event, callback) {
      elements.forEach((el) => {
        el.addEventListener(event, callback);
      });
    },
    val: function (newValue) {
      if (newValue !== undefined) {
        elements.forEach((el) => {
          el.value = newValue;
        });
      } else {
        return elements[0].value;
      }
    },
    prop: function (propName, propValue) {
      if (propValue !== undefined) {
        elements.forEach((el) => {
          el[propName] = propValue;
        });
      } else {
        return elements[0][propName];
      }
    },
    html: function (newHtml) {
      if (newHtml !== undefined) {
        elements.forEach((el) => {
          el.innerHTML = newHtml;
        });
      } else {
        return elements[0].innerHTML;
      }
    },
    trigger: function (event) {
      elements.forEach((el) => {
        el.dispatchEvent(new Event(event));
      });
    },
  };
}

// Fetch data from the server for courses.
axios
  .get(courseUrl)
  .then((response) => {
    const data = response.data;
    console.log('Fetched data:', data);

    if (!Array.isArray(data)) {
      throw new Error('Invalid data format. Expected an array.');
    }
    // Add a new option for each course in the fetched data
    data.forEach((course) => {
      const option = document.createElement('option');
      option.value = course.id; // Assuming each course object has an 'id' property
      option.textContent = course.display; // Correcting the property to 'display'
      courseSelector.append(option);
    });
  })
  .catch((error) => {
    console.error('Error fetching or processing data:', error);
  });

// Add change event listener to the course select element
courseSelector.on('change', function () {
  // Check if a course is selected
  if (courseSelector.val()) {
    // Show the UVU ID input
    uvuIdInput.css('display', 'block');
  } else {
    // Hide the UVU ID input if no course is selected
    uvuIdInput.css('display', 'none');
  }
});

// Add input event listener to the UVU ID input for character length validation
uvuIdInput.on('input', function () {
  const uvuId = uvuIdInput.val();

  // Check if all characters are numbers
  const allCharactersAreNumbers = /^\d+$/.test(uvuId);

  // Update the input border color based on the validation result
  uvuIdInput.css('borderColor', allCharactersAreNumbers ? '' : 'red');

  // Check if the UVU ID is 8 digits
  if (allCharactersAreNumbers && uvuId.length === 8) {
    axios
      .get(logUrl)
      .then((response) => {
        const data = response.data;
        console.log('Fetched data:', data);

        if (!Array.isArray(data)) {
          throw new Error('Invalid data format. Expected an array.');
        }

        // Clear existing logs before fetching and displaying new ones
        logs.empty();
        // Assuming uvuIdDisplay is not needed
        // uvuIdDisplay.text(`Student Logs for ${uvuId}`);

        // Add a new li element for each log in the fetched data
        data.forEach((log) => {
          const listItem = document.createElement('li');

          // Create the content for the li element
          listItem.innerHTML = `
            <div><small>${log.date}</small></div>
            <pre><p>${log.text}</p></pre>
          `;

          // Append the li element to the logs ul
          logs.append(listItem);

          // Add click event listener to each li element
        });
      })
      .catch((error) => {
        console.error('Error fetching or processing data:', error);
      });

    // Assuming uvuIdInput.val(uvuId); is not needed
    console.log('Valid UVU ID:', uvuId);
  } else {
    // Clear any previous results or messages
    console.log('Invalid UVU ID');
  }
  toggleAddLogButton();
});

// Add click event listener to the logs element
logs.on('click', function (event) {
  const clickedLog = event.target.closest('li'); // Find the closest ancestor li element

  // Toggle the visibility of the pre element (comment) within the clicked log
  const comment = clickedLog.querySelector('pre p');
  comment.style.display = comment.style.display === 'none' ? 'block' : 'none';
});

function toggleAddLogButton() {
  addLogBtn.prop(
    'disabled',
    !(logs.html().trim() !== '' && logTextarea.val().trim() !== '')
  );
}

logTextarea.on('input', function () {
  // Toggle the "Add Log" button based on conditions
  toggleAddLogButton();
});

addLogBtn.on('click', function (event) {
  event.preventDefault();

  const uvuId = uvuIdInput.val();
  const courseId = courseSelector.val();
  const logText = logTextarea.val();

  // Check if all necessary information is available
  if (uvuId && courseId && logText) {
    // TODO: Use Axios PUT to send the log data to json-server

    // Get the current date and time
    const currentDate = new Date().toLocaleString();
    axios
      .post(logUrl, {
        uvuId: uvuId,
        courseId: courseId,
        date: currentDate,
        text: logText,
      })
      .then((response) => {
        // Log success or handle response as needed
        console.log('Log added successfully:', response.data);

        // Clear the log textarea
        logTextarea.val('');

        // Refresh the displayed logs
        uvuIdInput.trigger('input');
      })
      .catch((error) => {
        console.error('Error adding log:', error);
      });
  }
});
