<a name="TOC"></a>

<h3 align="center">
  CONTAINER SCHEDULER
</h3>

<div align="center">
  <a href="https://www.npmjs.com/package/container_scheduler"><img src="https://img.shields.io/npm/v/container_scheduler.svg?style=flat" alt="npm version"></a>
  <a href="https://nodejs.org/en/"><img src="https://img.shields.io/badge/made%20with-node-1f425f?logo=node.js&.svg" /></a>
  <a href="https://github.com/lucasvtiradentes/container_scheduler#contributing"><img src="https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat" alt="contributions" /></a>
</div>

<p align="center">
  <a href="#dart-features">Features</a> • <a href="#warning-requirements">Requirements</a> • <a href="#bulb-usage">Usage</a> • <a href="#wrench-development">Development</a> • <a href="#books-about">About</a> • <a href="#family-community">Community</a>
</p>

<details>
  <summary align="center"><span>see <b>table of content</b></span></summary>
  <p align="center">
    <ul>
      <li><a href="#trumpet-overview">Overview</a></li>
      <li><a href="#motivation">Motivation</a></li>
      <li><a href="#dart-features">Features</a></li>
      <li><a href="#warning-requirements">Requirements</a></li>
      <li>
        <a href="#bulb-usage">Usage</a>
        <ul>
          <li><a href="#available-configs-options">Available configs options</a></li>
          <li><a href="#available-cli-options">Available CLI options</a></li>
        </ul>
      </li>
      <li>
        <a href="#wrench-development">Development</a>
        <ul>
          <li><a href="#development-setup">Development setup</a></li>
          <li><a href="#used-technologies">Used technologies</a></li>
        </ul>
      </li>
      <li>
        <a href="#books-about">About</a>
        <ul>
          <li><a href="#license">License</a></li>
        </ul>
      </li>
    </ul>
  </p>
</details>

<a href="#"><img src="./.github/images/divider.png" /></a>

## :trumpet: Overview

Automatically control your docker containers up/down behavior based on a simple config file.

## :question: Motivation

My main motivation for building this tool was to reduce my time spent on setting up infra related containers on my machine or in my hobby/VPS projects.

## :dart: Features<a href="#TOC"><img align="right" src="./.github/images/up_arrow.png" width="22"></a>

&nbsp;&nbsp;&nbsp;✔️ type safe api methods by using [zod](https://github.com/colinhacks/zod) validation;<br>
&nbsp;&nbsp;&nbsp;✔️ supports configs for [Dockerfile](https://docs.docker.com/engine/reference/builder/), complete [docker-compose](https://docs.docker.com/compose/compose-file/compose-file-v3/) or a single service of it;<br>
&nbsp;&nbsp;&nbsp;✔️ two ways to specify [time-configuration](./src/schemas/containers.schema.ts) for each container: per weekday or global (everyday) one;<br>
&nbsp;&nbsp;&nbsp;✔️ allows logs exporting to track which and when actions were done;<br>
&nbsp;&nbsp;&nbsp;✔️ three modes to overriding time configuration: on (always on), of (always off) and auto (follows the time configuration);<br>
&nbsp;&nbsp;&nbsp;✔️ all customizable by specifying custom [options](./src/schemas/options.schema.ts);<br>

## :warning: Requirements<a href="#TOC"><img align="right" src="./.github/images/up_arrow.png" width="22"></a>

In order to use this project in your computer, you need to have the following items:

- [npm](https://www.npmjs.com/): To install the package. Npm is installed alongside nodejs;
- [nodejs](https://nodejs.org/en/): To actually run the package.

## :bulb: Usage<a href="#TOC"><img align="right" src="./.github/images/up_arrow.png" width="22"></a>

To use it from the registry, first install the npm package:

```bash
# Install the package
npm install container_scheduler -g
```

Create a container configs file such as this (which follows [this schema](./src/schemas/configs_file.schema.ts)):

```json
{
  "options": {
    "timezone": "America/Belem",
  },
  "containers": {
    "docker_composes": [
      {
        "name": "develop",
        "mode": "auto",
        "path": "/home/lucasvtiradentes/repos/github/projects/lifetracer_setup/env/develop/docker-compose.yml",
        "configs": [
          ["mon", "on", "07:00", "23:00"],
          ["tue", "on", "07:00", "23:00"],
          ["wed", "on", "07:00", "23:00"],
          ["thu", "on", "07:00", "23:00"],
          ["fri", "on", "07:00", "23:00"],
          ["sat", "on", "07:00", "23:00"],
          ["sun", "on", "07:00", "23:00"]
        ]
      },
      {
        "name": "alfa",
        "mode": "off",
        "path": "/home/lucasvtiradentes/repos/github/projects/lifetracer_setup/env/alfa/docker-compose.yml",
        "configs": ["06:30", "23:59"]
      }
    ],
    "docker_compose_services": [
      {
        "name": "devops",
        "mode": "off",
        "path": "/home/lucasvtiradentes/repos/github/projects/lifetracer_setup/devops/docker-compose.yml",
        "configs": ["06:30", "23:07"],

        "service_name": "traefik"
      }
    ],
    "docker_files": [
      {
        "name": "pdv365",
        "mode": "off",
        "path": "/home/lucasvtiradentes/Desktop/repos/uds/pdv365/Dockerfile.prod",
        "configs": ["06:30", "12:00"],

        "mount_path": "/home/lucasvtiradentes/Desktop/repos/uds/pdv365",
        "image_name": "pdv_franqueadora_front_dev_image",
        "container_name": "pdv_franqueadora_front_dev_container",
        "options": "-d -p 3100:3100 -v \"$(pwd):/app\" -v /app/node_modules",
      }
    ]
  }
}
```

After that you can simply setup the cronjob to run every five minutes (if not changed by the options):

```bash
container_scheduler -s "/$USER/Desktop/configs.json"
# cs -s "/$USER/Desktop/configs.json"  <-- works as well
```

And thats it! now the program will run every five minutes and perform the necessary actions (up/down containers).

Notice that you can specify some [options](./src/schemas/options.schema.ts) according to your needs.

To see further usage, check out the provided [example](./examples/simple.sh).

### Available configs options

```json
{
  "timezone": "UTC",
  "cronjob_prefix": "CONTAINER_SCHEDULER_SETUP",
  "string_divider": " | ",
  "empty_column_symbol": "-",
  "parse_boolean_values_to_emojis": false,
  "debug_mode": false,
  "loop_mode_check_interval_minutes": 5,
  "log_file": "",
  "log_file_maximum_lines": 10
}
```

Notice that the aboce options are the default options. Also, if you want to enable the log feature, you need to specify a path for the log file (on the `log_file` option), the file don't need to exist.

### Available CLI options

```bash
📅 container scheduler package with minimum configuration.

Options:
  -V, --version          output the version number
  -s, --setup <file>     setup the cronjob to run the checking every x minutes
  -r, --remove           remove the cronjob to run the checking
  -c, --checking <file>  checking mode
  -h, --help             display help for command
```

## :wrench: Development<a href="#TOC"><img align="right" src="./.github/images/up_arrow.png" width="22"></a>

### Development setup

To setup this project in your computer, download it in this link or run the following commands:

```bash
# Clone this repository
$ git clone https://github.com/lucasvtiradentes/container_scheduler

# Go into the repository
$ cd container_scheduler
```

After download it, go to the project folder and run these commands:

```bash
# Install dependencies using npm
$ npm install

# Run the typescript code in development mode
$ npm run dev
```

If you want to contribute to the project, after you make the necessary changes, run these commands to check if everything is working fine:

```bash
# Compile the code into javascript
$ npm run build

# Run the compiled code in production mode
$ npm run start
```

### Used technologies

This project uses the following thechnologies:

<div align="center">
  <table>
    <tr>
      <th>Scope</th>
      <th>Subject</th>
      <th>Technologies</th>
    </tr>
    <tr>
      <td rowspan="1">Project</td>
      <td>Main</td>
      <td align="center">
        <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/Node.js-339933?logo=nodedotjs&logoColor=white"></a>
        <a target="_blank" href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/typescript-%23007ACC.svg?logo=typescript&logoColor=white"></a>
        <a target="_blank" href="https://reactjs.org/"><img src="https://img.shields.io/badge/react-%2320232a.svg?logo=react&logoColor=%2361DAFB"></a>
      </td>
    </tr>
    <tr>
      <td rowspan="3">Setup</td>
      <td>Code linting</td>
      <td align="center">
        <a href="https://github.com/prettier/prettier"><img src="https://img.shields.io/badge/prettier-1A2C34?logo=prettier&logoColor=F7BA3E"></a>
        <a href="https://github.com/eslint/eslint"><img src="https://img.shields.io/badge/eslint-3A33D1?logo=eslint&logoColor=white"></a>
      </td>
    </tr>
    <tr>
      <!-- <td rowspan="3">Setup</td> -->
      <td>Commit linting</td>
      <td align="center">
      <a target="_blank" href="https://github.com/conventional-changelog/commitlint"><img src="https://img.shields.io/badge/commitlint-red?logo=commitlint&logoColor=white"></a>
      <a target="_blank" href="https://github.com/commitizen/cz-cli"><img src="https://img.shields.io/badge/commitizen-pink?logo=conventionalcommits&logoColor=white"></a>
      <!-- <a href="https://gitmoji.dev"><img src="https://img.shields.io/badge/gitmoji-%20😜%20😍-FFDD67.svg?style=flat-square" alt="Gitmoji"/></a> -->
      </td>
    </tr>
    <tr>
      <!-- <td rowspan="1">Setup</td> -->
      <td>Other</td>
      <td align="center">
        <a href="https://editorconfig.org/"><img src="https://img.shields.io/badge/Editor%20Config-E0EFEF?logo=editorconfig&logoColor=000"></a>
        <a target="_blank" href="https://github.com/typicode/husky"><img src="https://img.shields.io/badge/🐶%20husky-green?logo=husky&logoColor=white"></a>
        <!-- <a target="_blank" href="https://github.com/okonet/lint-staged"><img src="https://img.shields.io/badge/🚫%20lint%20staged-yellow?&logoColor=white"></a> -->
      </td>
    </tr>
  </table>
</div>

<a href="#"><img src="./.github/images/divider.png" /></a>

## :books: About<a href="#TOC"><img align="right" src="./.github/images/up_arrow.png" width="22"></a>

## License

This project is distributed under the terms of the MIT License Version 2.0. A complete version of the license is available in the [LICENSE](LICENSE) file in this repository. Any contribution made to this project will be licensed under the MIT License Version 2.0.

<a href="#"><img src="./.github/images/divider.png" /></a>

<div align="center">
  <p>
    <a target="_blank" href="https://www.linkedin.com/in/lucasvtiradentes/"><img src="https://img.shields.io/badge/-linkedin-blue?logo=Linkedin&logoColor=white" alt="LinkedIn"></a>
    <a target="_blank" href="mailto:lucasvtiradentes@gmail.com"><img src="https://img.shields.io/badge/gmail-red?logo=gmail&logoColor=white" alt="Gmail"></a>
    <a target="_blank" href="https://discord.com/users/262326726892191744"><img src="https://img.shields.io/badge/discord-5865F2?logo=discord&logoColor=white" alt="Discord"></a>
    <a target="_blank" href="https://github.com/lucasvtiradentes/"><img src="https://img.shields.io/badge/github-gray?logo=github&logoColor=white" alt="Github"></a>
  </p>
  <p>Made with ❤️ by <strong>Lucas Vieira</strong></p>
  <p>👉 See also all <a href="https://github.com/lucasvtiradentes/lucasvtiradentes/blob/master/portfolio/PROJECTS.md#TOC">my projects</a></p>
  <p>👉 See also all <a href="https://github.com/lucasvtiradentes/my-tutorials#readme">my articles</a></p>
</div>