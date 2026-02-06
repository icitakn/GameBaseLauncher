const checker = require('license-checker')
const fs = require('fs').promises
const path = require('path')

checker.init(
  {
    start: path.join(__dirname, '..'),
    production: true,
    customFormat: {
      name: '',
      version: '',
      licenses: '',
      repository: '',
      publisher: ''
    }
  },
  async (err, packages) => {
    if (err) {
      console.error(err)
      process.exit(1)
    }

    let output = 'THIRD PARTY LICENSES\n'
    output += '='.repeat(80) + '\n\n'

    for (const [key, pkg] of Object.entries(packages)) {
      output += `${pkg.name}@${pkg.version}\n`
      output += `License: ${pkg.licenses}\n`
      if (pkg.repository) {
        output += `Repository: ${pkg.repository}\n`
      }
      if (pkg.publisher) {
        output += `Publisher: ${pkg.publisher}\n`
      }
      output += '\n' + '-'.repeat(80) + '\n\n'
    }

    await fs.writeFile('THIRD_PARTY_LICENSES.txt', output)
    console.log('✅ THIRD_PARTY_LICENSES.txt erstellt')
  }
)
