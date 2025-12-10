import swaggerJsdoc from 'swagger-jsdoc';

// 直接在脚本中定义Swagger配置
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: '德州扑克游戏API',
    version: '1.0.0',
    description: '德州扑克游戏后端API文档',
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: '本地开发服务器',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
};

// 配置swagger-jsdoc
const options = {
  swaggerDefinition,
  apis: ['../poker-backend/src/routes/*.ts', '../poker-backend/src/types/*.ts'], // 指向包含Swagger注释的文件
};

// 生成Swagger文档
const swaggerSpec = swaggerJsdoc(options);

// 输出文档
console.log(JSON.stringify(swaggerSpec, null, 2));