import { RicApi } from '@ricdotnet/api'
import { db } from './database.js';
import { HttpStatusCode } from '@ricdotnet/api/src/errors/HttpStatusCodes.js';

RicApi()
  .get('/stats', async (ctx) => {
    let rows;
    
    console.log('GET /stats', new Date());
    
    let connection;
    try {
      connection = await db.getConnection();
      const preparedStatement = await connection.prepare('SELECT * FROM events');
      [rows] = await preparedStatement.execute();
    } catch (error) {
      console.error('Error getting stats data', error);
    }

    connection.release();
    
    ctx.response(reduceRows(rows));
  })
  .post('/stats', async (ctx) => {
    const { keyboardClicks, mouseLeftClicks, mouseRightClicks, mouseScroll } = snakeToCamel(ctx.body);

    console.log('POST /stats', new Date(), ctx.body);

    let connection;
    try {
      connection = await db.getConnection();
      const preparedStatement = await connection.prepare('INSERT INTO events (keyboard_clicks, mouse_scroll, mouse_left_click, mouse_right_click) VALUES (?, ?, ?, ?)');
      await preparedStatement.execute([keyboardClicks, mouseScroll, mouseLeftClicks, mouseRightClicks]);
    } catch (error) {
      console.error('Error inserting data into database', error);
    }

    connection.release();

    ctx.statusCode = HttpStatusCode.CREATED;
  })
  .start(3000);
  
function reduceRows(rows) {
  return rows.reduce((acc, row) => {
    return {
      keyboardClicks: acc.keyboardClicks + row.keyboard_clicks,
      mouseLeftClicks: acc.mouseLeftClicks + row.mouse_left_click,
      mouseRightClicks: acc.mouseRightClicks + row.mouse_right_click,
      mouseScroll: acc.mouseScroll + row.mouse_scroll,
    };
  }, { keyboardClicks: 0, mouseLeftClicks: 0, mouseRightClicks: 0, mouseScroll: 0 });
}
  
function snakeToCamel(obj) {
  return Object.keys(obj).reduce((acc, key) => {
    const newKey = key.replace(/_([a-z])/g, (_, char) => char.toUpperCase());
    acc[newKey] = obj[key];
    return acc;
  }, {});
}