import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/tickets';
import { natsWrapper } from '../../nats-wrapper';

it('Has a route handler listening to /api/tickets for post request', async () => {
  const response = await request(app).post('/api/tickets').send({});

  expect(response.status).not.toEqual(404);
});
it('It can only be access if the user is singned in ', async () => {
  await request(app).post('/api/tickets').send({}).expect(401);
});

it('returns a status other than 401 if the user is signed in', async () => {
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({});
  console.log(response.status);
  expect(response.status).not.toEqual(401);
});
it('returns an error if an invalid title is provided', async () => {
  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      title: '',
      price: 99,
    })
    .expect(400);

  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      price: 99,
    })
    .expect(400);
});
it('returns an error if an invalid price is provided', async () => {
  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      title: 'Ticket Test',
      price: -10,
    })
    .expect(400);

  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      title: 'Ticket Test',
    })
    .expect(400);
});
it('creates a ticket with valid inputs', async () => {
  //add in a check to make sure a ticket was saved
  let tickets = await Ticket.find({});
  expect(tickets.length).toEqual(0);

  const title = 'Ticket Test';

  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      title,
      price: 99,
    })
    .expect(201);

  tickets = await Ticket.find({});
  expect(tickets.length).toEqual(1);
  expect(tickets[0].price).toEqual(99);
  expect(tickets[0].title).toEqual(title);
});

it('publishes an event', async () => {
  const title = 'Ticket Test';

  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      title,
      price: 99,
    })
    .expect(201);

  console.log(natsWrapper);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
