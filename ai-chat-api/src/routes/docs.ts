import { Router } from 'express'
import swaggerUi from 'swagger-ui-express'
import yaml from 'js-yaml'
import fs from 'fs'
import path from 'path'

const router = Router()

// Load OpenAPI specification
const getOpenAPISpec = () => {
  try {
    const yamlPath = path.join(__dirname, '../../../docs/openapi.yml')
    const fileContents = fs.readFileSync(yamlPath, 'utf8')
    return yaml.load(fileContents)
  } catch (error) {
    console.error('Error loading OpenAPI spec:', error)
    return null
  }
}

// Swagger UI options
const swaggerOptions = {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'AI Chat API Documentation',
  customfavIcon: '/favicon.ico'
}

// Setup Swagger UI
const openapiSpec = getOpenAPISpec()
if (openapiSpec) {
  router.use('/', swaggerUi.serve)
  router.get('/', swaggerUi.setup(openapiSpec, swaggerOptions))
} else {
  router.get('/', (req, res) => {
    res.status(500).json({
      error: 'documentation_unavailable',
      message: 'API documentation is currently unavailable'
    })
  })
}

// Serve raw OpenAPI spec
router.get('/openapi.json', (req, res) => {
  const spec = getOpenAPISpec()
  if (spec) {
    res.json(spec)
  } else {
    res.status(500).json({
      error: 'spec_unavailable',
      message: 'OpenAPI specification is currently unavailable'
    })
  }
})

// Serve raw OpenAPI spec as YAML
router.get('/openapi.yml', (req, res) => {
  try {
    const yamlPath = path.join(__dirname, '../../../docs/openapi.yml')
    const fileContents = fs.readFileSync(yamlPath, 'utf8')
    res.set('Content-Type', 'text/yaml')
    res.send(fileContents)
  } catch (error) {
    res.status(500).json({
      error: 'spec_unavailable',
      message: 'OpenAPI specification is currently unavailable'
    })
  }
})

export default router