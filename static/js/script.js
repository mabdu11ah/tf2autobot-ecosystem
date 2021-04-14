// Initiate Dropdowns
$('#TIMEZONE').dropdown({
  values: timezones.map((t) => ({
    name: t,
    value: t,
    selected: t === 'Europe/London',
  })),
});

$('#ALERTS').dropdown({
  values: [
    {
      name: 'Trade',
      value: 'trade',
      selected: true,
    },
    {
      name: 'Version',
      value: 'version',
      selected: true,
    },
    {
      name: 'None',
      value: 'none',
    },
  ],
});

// Constants
const defaultEnvironment = {
  NODE_ENV: 'production',

  STEAM_ACCOUNT_NAME: '',
  STEAM_PASSWORD: '',
  STEAM_SHARED_SECRET: '',
  STEAM_IDENTITY_SECRET: '',

  BPTF_ACCESS_TOKEN: '',
  BPTF_API_KEY: '',

  ADMINS: [],
  KEEP: [],
  ITEM_STATS_WHITELIST: [],
  GROUPS: [],
  ALERTS: ['trade', 'version'],

  ENABLE_SOCKET: true,
  CUSTOM_PRICER_URL: '',
  CUSTOM_PRICER_API_TOKEN: '',

  SKIP_BPTF_TRADEOFFERURL: true,
  SKIP_UPDATE_PROFILE_SETTINGS: true,

  TIMEZONE: 'Europe/London',
  CUSTOM_TIME_FORMAT: 'MMMM Do YYYY, HH:mm:ss ZZ',
  TIME_ADDITIONAL_NOTES: '',

  DEBUG: true,
  DEBUG_FILE: true,

  ENABLE_HTTP_API: false,
  HTTP_API_PORT: 3001,
};

const pm2DefaultEcosystem = {
  apps: [
    {
      name: 'tf2autobot',
      script: 'dist/app.js',
      exec_mode: 'fork',
      shutdown_with_message: false,
      max_memory_restart: '1500M',
      kill_retry_time: 30000,
      kill_timeout: 60000,
      out_file: 'NULL',
      error_file: 'NULL',
      env: null,
    },
  ],
};

// Custom Pricer and API
$('#custom-pricer').change(function () {
  $('#custom-pricer-div').css('display', this.checked ? 'block' : 'none');
});

$('#ENABLE_HTTP_API').change(function () {
  $('#api-port-div').css('display', this.checked ? 'flex' : 'none');
});

// Main Functions
function generate() {
  const isPM2 = $('#pm2').is(':checked');
  const environment = getEnvironment();

  const generator = isPM2 ? generatePM2 : generateENV;
  generator(environment);
}

function generatePM2(environment) {
  const ecosystem = { ...pm2DefaultEcosystem };
  ecosystem.apps[0].env = environment;

  const json = JSON.stringify(ecosystem, null, 4);
  download('ecosystem.json', json);
}

function generateENV(environment) {
  var dotEnvString = new String();

  for (const key in environment) {
    const value = environment[key];

    dotEnvString += `${key}=${JSON.stringify(value)}\n`;
  }

  download('tf2autobot.env', dotEnvString);
}

// Helpers
function getGenerator() {}

function getEnvironment() {
  const env = { ...defaultEnvironment };

  const vals = [
    'STEAM_ACCOUNT_NAME',
    'STEAM_PASSWORD',
    'STEAM_SHARED_SECRET',
    'STEAM_IDENTITY_SECRET',
    'BPTF_ACCESS_TOKEN',
    'BPTF_API_KEY',
    'CUSTOM_PRICER_URL',
    'CUSTOM_PRICER_API_TOKEN',
    'CUSTOM_TIME_FORMAT',
    'TIME_ADDITIONAL_NOTES',
    'HTTP_API_PORT',
  ];
  const arrayVals = ['ADMINS', 'KEEP', 'ITEM_STATS_WHITELIST', 'GROUPS'];
  const checkboxVals = ['ENABLE_SOCKET', 'SKIP_BPTF_TRADEOFFERURL', 'SKIP_UPDATE_PROFILE_SETTINGS', 'DEBUG', 'DEBUG_FILE', 'ENABLE_HTTP_API'];

  vals.forEach((val) => (env[val] = $('#' + val).val()));
  arrayVals.forEach((val) => (env[val] = formatArrayInput($('#' + val).val())));
  checkboxVals.forEach((val) => (env[val] = $('#' + val).is(':checked')));

  env.SKIP_BPTF_TRADEOFFERURL = !env.SKIP_BPTF_TRADEOFFERURL;
  env.SKIP_UPDATE_PROFILE_SETTINGS = !env.SKIP_UPDATE_PROFILE_SETTINGS;

  env.ALERTS = formatArrayInput($('#ALERTS').dropdown('get value'));
  env.TIMEZONE = $('#TIMEZONE').dropdown('get value');

  return env;
}

function formatArrayInput(value) {
  return value.trim() === '' ? [] : value.replace(/ /g, '').split(',');
}
