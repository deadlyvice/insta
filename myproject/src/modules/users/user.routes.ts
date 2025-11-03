import { FastifyInstance } from 'fastify';

const mockUser = {
    id: 0,
    name: 'mock',
    email: 'mock@example.com',
    nickname: 'mock',
};
// import { UserService } from './user.service';
// import { createUserSchema, userResponseSchema } from './user.schemas';

export async function userRoutes(app: FastifyInstance) {
//   const service = new UserService();

  app.get('/', {
    
    schema: {
    //   response: { 200: { type: 'array', items: userResponseSchema } },
    },
    handler: async (req, res) => {
    //   const users = await service.getAll();
    //   return users;
    return mockUser
    },
  });

  app.post('/', {
    // schema: { body: createUserSchema, response: { 201: userResponseSchema } },
    handler: async (req, res) => {
    //   const user = await service.create(req.body);
      res.code(201).send(mockUser);
    }
    
  });

  app.patch('/:id', {
    handler: (req, res) =>{
        res.send({...mockUser, ...req.body!})
    }
  })

  app.delete('/:id', {
    handler: (req, res) =>{
        res.send({})
    }
  })
}
