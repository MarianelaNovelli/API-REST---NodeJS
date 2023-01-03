import express, {Router} from 'express'
import sql from 'mssql'

const app = express(); 
import rows from 'mssql';

/* EJS */
app.set('view engine', 'ejs');

/* Configuración del puerto: */
let port; 
app.set('port', port || 3000);

app.listen(app.get('port'));

console.log('Servidor corriendo en el puerto', app.get('port'));

const sqlConfig = {
  user: 'marianela',
  password: '1234',
  database: 'male',
  server: 'localhost',
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  },
  options: {
    encrypt: true, 
    trustServerCertificate: true
  }
};

async function getConnection() {
 try {
    const pool = await sql.connect(sqlConfig);
    return pool; 
 } catch (err) {
    console.error(err);
 }
};

getConnection();

/* Módulos para recibir datos en .json y desde formularios HTML: */
app.use(express.json());
app.use(express.urlencoded({extended: false}));

/* Funciones relacionadas a las tablas de la base de datos: */
const router = Router();

/*--------------------------------------------------------------------*/
/* Mostrar datos: */
const getPersonas = async (req, res) => { 
  const pool = await getConnection();
  const result = await pool.request().query('select * from ismst_personas', (err, rows) => {
    if (err) {
      throw err;
    } else {
      res.render('index.ejs', { resultado: rows.recordset });
    }
  });
};

  //console.log(result);
  //res.json(result.recordset);

  //} catch (error) {
    //res.status(500);
    //res.send(error.message);
  //}

app.get('/consultaGet', getPersonas);

/*--------------------------------------------------------------------*/
/* Insertar datos: */
const InsertarNuevaPersona = async (req, res) => {
  try {
  const { COD, NOMBRE, DIRECCION, NUMERO, LOCALIDAD, DESCRIPCION, JOB_ID } = req.body;
  const pool = await getConnection();
  const result = await pool.request()
  .input("COD", sql.Char, COD)
  .input("NOMBRE", sql.Char, NOMBRE)
  .input("DIRECCION", sql.VarChar, DIRECCION)
  .input("NUMERO", sql.Char, NUMERO)
  .input("LOCALIDAD", sql.Char, LOCALIDAD)
  .input("DESCRIPCION", sql.Text, DESCRIPCION)
  .input("JOB_ID", sql.Numeric, JOB_ID)
  .query('insert into ismst_personas(COD, NOMBRE, DIRECCION, NUMERO, LOCALIDAD, DESCRIPCION, JOB_ID) values(@COD, @NOMBRE, @DIRECCION, @NUMERO, @LOCALIDAD, @DESCRIPCION, @JOB_ID)');
  
  /*PRUEBA MANUAL*/
  /*await pool.request().query("insert into ismst_personas(COD, NOMBRE, DIRECCION, NUMERO, LOCALIDAD, DESCRIPCION, JOB_ID) values('16', 'Flavia', 'Ortiz', '100', '3', 'Empleada', '8')");*/

  /*console.log(COD, NOMBRE, DIRECCION, NUMERO, LOCALIDAD, DESCRIPCION, JOB_ID);*/

  res.json({ COD, NOMBRE, DIRECCION, NUMERO, LOCALIDAD, DESCRIPCION, JOB_ID });
  console.log(result);

  } catch (error) {
    res.status(500);
    res.send(error.message);
  }
};

app.post('/consultaPost', InsertarNuevaPersona);

/*--------------------------------------------------------------------*/
/* Mostrar datos por clave única: */ 
const getPersonaByCOD = async (req, res) => {
    try {
    const {COD} = req.body; 
    console.log(COD);
    const pool = await getConnection();
    const result = await pool.request()
    .input("COD", sql.Char, COD)
    .query('select * from ismst_personas WHERE COD = @COD');

    res.json(result.recordset); 
   
    } catch (error) {
      res.status(500);
      res.send(error.message);
    }
};

app.get('/consultaGetCOD', getPersonaByCOD);

/*--------------------------------------------------------------------*/
/* Eliminar registros por clave única: */ 
const deletePersonaByCOD = async (req, res) => {
  try {
    const {COD} = req.body;
    console.log("Borrando registro " + COD);
    const pool = await getConnection();
    const result = await pool.request()
    .input("COD", sql.Char, COD)
    .query('delete from ismst_personas WHERE COD = @COD');

    res.json(result.recordset);

  } catch (error) {
    res.status(500);
    res.send(error.message);  
  }
};

app.delete('/consultaDelete', deletePersonaByCOD);

/*--------------------------------------------------------------------*/