const apiKey = `1FyswLynq7PUOTS5dzBJ`;

const getData = async(url) => {
  const response = await fetch(url);
  const data = await response.json();
  return data;
}

const getStreets = async(userSearch) => {
  const streetName = `${userSearch}`
  const streetUrl = `https://api.winnipegtransit.com/v3/streets.json?api-key=1FyswLynq7PUOTS5dzBJ&name=${streetName}&usage=long`;
  const streetData = await getData(streetUrl);
  const streetsArray = streetData.streets;
  return streetsArray;
}

const getStops = async(streetKey) => {
  const stopUrl = `https://api.winnipegtransit.com/v3/stops.json?api-key=1FyswLynq7PUOTS5dzBJ&street=${streetKey}&usage=long`;
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

const render2 = async(streetKey) => {
  const scheduleArray = await getStopsSchedule(streetKey);
  renderSchedule(scheduleArray);
}

const renderSchedule = async(scheduleArray) => {
  const scheduleContainer = document.querySelector('.schedule-container');
  scheduleArray.forEach(schedule => {
    const routeScheduleArray = schedule['stop-schedule']['route-schedules'];
    for (const value of routeScheduleArray) {
      scheduleContainer.insertAdjacentHTML('beforeend',
      `
      <tr>
        <td>${schedule['stop-schedule'].stop.name}</td>
        <td>${schedule['stop-schedule'].stop['cross-street'].name}</td>
        <td>${schedule['stop-schedule'].stop.direction}</td>
        <td>${value.route.number}</td>
        <td>${formatTime(value['scheduled-stops'][0].times.arrival.scheduled)}</td>
      </tr>

      <tr>
        <td>${schedule['stop-schedule'].stop.name}</td>
        <td>${schedule['stop-schedule'].stop['cross-street'].name}</td>
        <td>${schedule['stop-schedule'].stop.direction}</td>
        <td>${value.route.number}</td>
        <td>${formatTime(value['scheduled-stops'][1].times.arrival.scheduled)}</td>
      </tr>
      `);
    }
  });
}

const formatTime = (date) => {
  return new Date(date).toLocaleTimeString('en-CA', {hour:'2-digit', minute: '2-digit',hour12: true})
}

const streets = document.querySelector('.streets');

const renderStreets = (streetsArray) => {
  streetsArray.forEach(street => {
    streets.insertAdjacentHTML('beforeend', 
    `
    <a href="#" data-street-key="${street.key}">${street.name}</a>
    `);
  });
}

const input = document.querySelector('.input');

input.addEventListener('submit', (e) => {
  let userSearch = e.target.firstElementChild.value;
  getStreets(userSearch);
  render(userSearch);
  userSearch = '';
});

streets.addEventListener('click', (e) => {
  const eventTarget = e.target;
  if (eventTarget.nodeName === 'A') {
    getStops(e.target.dataset.streetKey);
    render2(e.target.dataset.streetKey);
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