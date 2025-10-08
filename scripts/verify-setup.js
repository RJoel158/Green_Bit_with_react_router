// scripts/verify-setup.js
/**
 * Script de verificación del sistema GreenBit
 * Verifica que todas las configuraciones y dependencias estén correctas
 */

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

// Colores para output en consola
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

class SetupVerifier {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.success = [];
  }

  log(message, type = 'info') {
    const color = colors[type] || colors.reset;
    console.log(`${color}${message}${colors.reset}`);
  }

  error(message) {
    this.errors.push(message);
    this.log(`❌ ${message}`, 'red');
  }

  warning(message) {
    this.warnings.push(message);
    this.log(`⚠️  ${message}`, 'yellow');
  }

  success(message) {
    this.success.push(message);
    this.log(`✅ ${message}`, 'green');
  }

  info(message) {
    this.log(`ℹ️  ${message}`, 'blue');
  }

  // Verificar existencia de archivos
  checkFileExists(filePath, description) {
    if (fs.existsSync(filePath)) {
      this.success(`${description} existe`);
      return true;
    } else {
      this.error(`${description} no encontrado: ${filePath}`);
      return false;
    }
  }

  // Verificar archivo .env
  checkEnvFile(envPath, requiredVars) {
    if (!this.checkFileExists(envPath, 'Archivo .env')) {
      return false;
    }

    try {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const missingVars = [];

      requiredVars.forEach(varName => {
        if (!envContent.includes(`${varName}=`)) {
          missingVars.push(varName);
        }
      });

      if (missingVars.length > 0) {
        this.error(`Variables faltantes en ${envPath}: ${missingVars.join(', ')}`);
        return false;
      } else {
        this.success(`Todas las variables requeridas están presentes en ${envPath}`);
        return true;
      }
    } catch (error) {
      this.error(`Error leyendo ${envPath}: ${error.message}`);
      return false;
    }
  }

  // Verificar conexión a base de datos
  async checkDatabaseConnection() {
    try {
      // Cargar variables de entorno del backend
      const envPath = path.join(__dirname, '../back/.env');
      if (!fs.existsSync(envPath)) {
        this.error('No se puede verificar BD: archivo .env del backend no existe');
        return false;
      }

      // Parsear archivo .env manualmente
      const envContent = fs.readFileSync(envPath, 'utf8');
      const envVars = {};
      
      envContent.split('\n').forEach(line => {
        const [key, ...valueParts] = line.trim().split('=');
        if (key && valueParts.length > 0) {
          envVars[key] = valueParts.join('=');
        }
      });

      const connection = await mysql.createConnection({
        host: envVars.DB_HOST || 'localhost',
        port: parseInt(envVars.DB_PORT) || 3306,
        user: envVars.DB_USER,
        password: envVars.DB_PASSWORD,
        database: envVars.DB_NAME
      });

      await connection.execute('SELECT 1');
      await connection.end();

      this.success('Conexión a base de datos exitosa');
      return true;
    } catch (error) {
      this.error(`Error conectando a base de datos: ${error.message}`);
      return false;
    }
  }

  // Verificar dependencias de Node.js
  checkNodeDependencies(packageJsonPath) {
    if (!this.checkFileExists(packageJsonPath, 'package.json')) {
      return false;
    }

    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      const nodeModulesPath = path.join(path.dirname(packageJsonPath), 'node_modules');

      if (!fs.existsSync(nodeModulesPath)) {
        this.error(`node_modules no encontrado en ${path.dirname(packageJsonPath)}`);
        return false;
      }

      this.success(`Dependencias instaladas en ${path.dirname(packageJsonPath)}`);
      return true;
    } catch (error) {
      this.error(`Error verificando dependencias: ${error.message}`);
      return false;
    }
  }

  // Verificar estructura de directorios
  checkDirectoryStructure() {
    const requiredDirs = [
      'back',
      'back/config',
      'back/Controllers',
      'back/Models',
      'back/Routes',
      'back/Services',
      'back/uploads',
      'back/uploads/images',
      'front',
      'front/src',
      'front/src/components',
      'front/src/config'
    ];

    let allExist = true;

    requiredDirs.forEach(dir => {
      const fullPath = path.join(__dirname, '..', dir);
      if (fs.existsSync(fullPath)) {
        this.success(`Directorio ${dir} existe`);
      } else {
        this.error(`Directorio faltante: ${dir}`);
        allExist = false;
      }
    });

    return allExist;
  }

  // Verificar permisos de archivos
  checkFilePermissions() {
    const uploadsDir = path.join(__dirname, '../back/uploads');
    
    try {
      // Intentar crear y eliminar un archivo de prueba
      const testFile = path.join(uploadsDir, 'test-permissions.txt');
      fs.writeFileSync(testFile, 'test');
      fs.unlinkSync(testFile);
      
      this.success('Permisos de escritura en directorio uploads correctos');
      return true;
    } catch (error) {
      this.error(`Problema con permisos en directorio uploads: ${error.message}`);
      return false;
    }
  }

  // Generar reporte final
  generateReport() {
    this.log('\n' + '='.repeat(50), 'blue');
    this.log('REPORTE DE VERIFICACIÓN DEL SISTEMA', 'blue');
    this.log('='.repeat(50), 'blue');

    this.log(`\n✅ Éxitos: ${this.success.length}`, 'green');
    this.log(`⚠️  Advertencias: ${this.warnings.length}`, 'yellow');
    this.log(`❌ Errores: ${this.errors.length}`, 'red');

    if (this.errors.length > 0) {
      this.log('\n🔧 ERRORES A CORREGIR:', 'red');
      this.errors.forEach((error, index) => {
        this.log(`${index + 1}. ${error}`, 'red');
      });
    }

    if (this.warnings.length > 0) {
      this.log('\n⚠️  ADVERTENCIAS:', 'yellow');
      this.warnings.forEach((warning, index) => {
        this.log(`${index + 1}. ${warning}`, 'yellow');
      });
    }

    const isHealthy = this.errors.length === 0;
    
    this.log('\n' + '='.repeat(50), 'blue');
    if (isHealthy) {
      this.log('🎉 SISTEMA LISTO PARA USAR', 'green');
    } else {
      this.log('🚨 SISTEMA REQUIERE ATENCIÓN', 'red');
    }
    this.log('='.repeat(50), 'blue');

    return isHealthy;
  }

  // Ejecutar todas las verificaciones
  async runAllChecks() {
    this.log('🔍 Iniciando verificación del sistema GreenBit...', 'blue');

    // Verificar estructura de directorios
    this.log('\n📁 Verificando estructura de directorios...');
    this.checkDirectoryStructure();

    // Verificar archivos .env
    this.log('\n🔧 Verificando configuración...');
    const backendRequiredVars = [
      'DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASSWORD', 'DB_NAME',
      'PORT', 'CORS_ORIGIN', 'JWT_SECRET'
    ];
    
    const frontendRequiredVars = [
      'VITE_API_BASE_URL', 'VITE_DEFAULT_MAP_CENTER_LAT', 'VITE_DEFAULT_MAP_CENTER_LNG'
    ];

    this.checkEnvFile(path.join(__dirname, '../back/.env'), backendRequiredVars);
    this.checkEnvFile(path.join(__dirname, '../front/.env'), frontendRequiredVars);

    // Verificar dependencias
    this.log('\n📦 Verificando dependencias...');
    this.checkNodeDependencies(path.join(__dirname, '../back/package.json'));
    this.checkNodeDependencies(path.join(__dirname, '../front/package.json'));

    // Verificar permisos de archivos
    this.log('\n🔐 Verificando permisos...');
    this.checkFilePermissions();

    // Verificar conexión a base de datos
    this.log('\n🗄️  Verificando base de datos...');
    await this.checkDatabaseConnection();

    // Generar reporte final
    return this.generateReport();
  }
}

// Ejecutar verificación si se llama directamente
if (require.main === module) {
  const verifier = new SetupVerifier();
  
  verifier.runAllChecks()
    .then(isHealthy => {
      process.exit(isHealthy ? 0 : 1);
    })
    .catch(error => {
      console.error('Error durante la verificación:', error);
      process.exit(1);
    });
}

module.exports = SetupVerifier;