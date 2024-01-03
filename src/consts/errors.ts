export const ERRORS = {
  invalid_timezone: 'specified timezone does not exists!',
  invalid_os: 'this package was designed to run on linux only!',
  json_not_found: (jsonPath: string) => `json ${jsonPath} was not found!`
};
