const apiKey = `1FyswLynq7PUOTS5dzBJ`;

const getData = async(url) => {
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  }catch (err) {
    console.error(err);
  }
}

const getStreets = async(userSearch) => {
  const streetName = `${userSearch}`
  const streetUrl = `https://api.winnipegtransit.com/v3/streets.json?api-key=1FyswLynq7PUOTS5dzBJ&name=${streetName}&usage=long`;
  const streetData = await getData(streetUrl);
  const streetsArray = streetData.streets;
  return streetsArray;
}

const getStops = async(streetKey) => {
  const stopUrl = `https://api.winnipegtransit.com/v3/stops.json?api-key=1FyswLynq7PUOTS5dzBJ&street=${streetKey}`;
  const stopData = await getData(stopUrl);
  const stopsArray = stopData.stops;
  return stopsArray;
}

const getStopsSchedule = async(streetKey) => {
  const stopsArray = await getStops(streetKey);
  const stopsSchedulePromises = [];
  for await (let stop of stopsArray) {
    const stopScheduleUrl = `https://api.winnipegtransit.com/v3/stops/${stop.key}/schedule.json?api-key=1FyswLynq7PUOTS5dzBJ&max-results-per-route=2`;
    const stopScheduleData = getData(stopScheduleUrl);
    stopsSchedulePromises.push(stopScheduleData);
  }
  return await Promise.all(stopsSchedulePromises);
}

const render = async(userSearch) => {
  const streetsArray = await getStreets(userSearch);
  renderStreets(streetsArray);
}

const renderTable = async(streetKey) => {
  const scheduleArray = await getStopsSchedule(streetKey);
  renderSchedule(scheduleArray);
}

const renderSchedule = async(scheduleArray) => {
  const scheduleContainer = document.querySelector('.schedule-container');
  const streetName = document.querySelector('#street-name');
  scheduleContainer.innerHTML = '';
  if (scheduleArray[0] === undefined) return scheduleContainer.innerHTML = `No schedule found`;
  scheduleArray.forEach(schedule => {
    const routeScheduleArray = schedule['stop-schedule']['route-schedules'];
    streetName.innerHTML = `Displaying results for ${schedule['stop-schedule'].stop.street.name}`
    for (const value of routeScheduleArray) {
      for (const element of value['scheduled-stops']) {
        if (element.times.arrival === undefined) return console.error('Arrival time is not mentioned');
        scheduleContainer.insertAdjacentHTML('beforeend',
        `
        <tr>
          <td>${schedule['stop-schedule'].stop.name}</td>
          <td>${schedule['stop-schedule'].stop['cross-street'].name}</td>
          <td>${schedule['stop-schedule'].stop.direction}</td>
          <td>${value.route.number}</td>
          <td>${formatTime(element.times.arrival?.scheduled)}</td>
        </tr>
        `);
      }
    }
  });
}

const formatTime = (date) => {
  return new Date(date).toLocaleTimeString('en-CA', {hour:'2-digit', minute: '2-digit',hour12: true})
}

const renderStreets = (streetsArray) => {
  streets.innerHTML = '';
  if (streetsArray[0] === undefined) return streets.innerHTML = `No streets found`;
  streetsArray.forEach(street => {
    streets.insertAdjacentHTML('beforeend', 
    `
    <a href="#" data-street-key="${street.key}">${street.name}</a>
    `);
  });
}

const input = document.querySelector('.input');
const streets = document.querySelector('.streets');

input.addEventListener('submit', (e) => {
  try {
    let userSearch = e.target.firstElementChild.value;
    getStreets(userSearch);
    render(userSearch);
  } catch(err) {
    console.error(err);
  }
});

streets.addEventListener('click', (e) => {
  try {
    const eventTarget = e.target;
    if (eventTarget.nodeName === 'A') {
      getStops(e.target.dataset.streetKey);
      renderTable(e.target.dataset.streetKey);
    }
  } catch (err) {
    console.error(err);
  }
});


















/*getData(streetUrl).then(streetData => {
  const streetsArray = streetData.streets;
  return streetsArray;
}).then(streetsArray => {
  console.log(streetsArray)
  const stopUrl = `https://api.winnipegtransit.com/v3/stops.json?api-key=1FyswLynq7PUOTS5dzBJ&street=${streetsArray[0].key}&usage=long`;
  getData(stopUrl).then(stopData => {
    const stopArray = stopData.stops;
    return stopArray;
  }).then(stopArray => {
    console.log(stopArray);
    stopArray.forEach(stop => {
      const stopScheduleUrl = `https://api.winnipegtransit.com/v3/stops/${stop.key}/schedule.json?api-key=1FyswLynq7PUOTS5dzBJ&max-results-per-route=2`;
    getData(stopScheduleUrl).then(stopScheduleData => {
      console.log(stopScheduleData['stop-schedule']);
    })
    })
  })
})*/

/* stopScheduleData['stop-schedule'].stop.name
  stopScheduleData['stop-schedule'].stop.direction
  stopScheduleData['stop-schedule'].stop.street.name
  stopScheduleData['stop-schedule'].stop['cross-street'].name
  stopScheduleData['stop-schedule']['route-schedules'][0].route.number
  stopScheduleData['stop-schedule']['route-schedules'][0]['scheduled-stops'][0].times.arrival.scheduled*/ 