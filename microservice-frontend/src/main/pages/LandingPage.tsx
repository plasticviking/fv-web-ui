import React, {useCallback, useEffect, useState} from 'react';
import {connect, useDispatch} from 'react-redux';
import {GET_TOKEN_REQUEST} from "../../state/actions";
import CONFIG from "../../config";
import axios from "axios";
import {useDropzone} from "react-dropzone";
import '../styles/base.scss';
import { Base64 } from 'js-base64';
import JSONPretty from 'react-json-pretty';

const LandingPage = (props) => {
  const {token} = props;
  const dispatch = useDispatch();
  const [working, setWorking] = useState(false);

  const load_files = () => {

    axios.get(`${CONFIG.API_BASE}/uploads`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }).then(response => {
      setFiles(response.data);
    })


  }

  const create_file_upload = () => {
    for (let file of readyToUploadFiles) {

      const payload = {
        filename: file.name,
      };

      file.arrayBuffer().then(buffer => {

        axios.post(`${CONFIG.API_BASE}/uploads`, payload, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }).then(response => {
          const {put} = response.data.object_urls;

          axios.put(
            put,
            buffer,
            {
              onUploadProgress: (event) => {
                //
              }
            }
          ).catch(err => {
            axios.put(
              put,
              buffer,
              {
                onUploadProgress: (event) => {
                  //
                }
              }
            )
          })
        });
      });
    }

  }


  const [files, setFiles] = useState([]);
  const [readyToUploadFiles, setReadyToUploadFiles] = useState([]);

  const [decoded, setDecoded] = useState({});
  useEffect(() => {
    if (token != null) {
      const parts = token.split('.');
      setDecoded({
        header: JSON.parse(Base64.decode(parts[0])),
        body: JSON.parse(Base64.decode(parts[1])),
        sig: parts[2]
      });
    }

  }, [token]);

  function drop_zone() {
    const onDrop = useCallback(acceptedFiles => {
      setReadyToUploadFiles(acceptedFiles);
    }, []);

    const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop, multiple: false})

    return (
      <div className={'dropzone'} {...getRootProps()}>
        <input {...getInputProps()} />
        {
          isDragActive ?
            <p>Drop files here</p> :
            <p>Drag or click to upload</p>
        }
      </div>
    )
  }

  const run_import = (f) => {
    console.log(`running import for ${f.id}`);
    console.dir(f);

    axios.get(`${CONFIG.API_BASE}/uploads/${f.id}/nuxeo_url`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }).then((nuxeo_url_response) => {

      const payload = {
        params: {
          'file_name': f.filename,
          'file_url': nuxeo_url_response.data.url,
        }
      };

      axios.post(`${CONFIG.NUXEO_API}/v1/automation/Microservices.FileImport`, payload).then((response) => {
        console.dir(response);
      });
    })


  }

  return (
    <div>
      <div className={'header'}>
        <h1>FirstVoices Microservices Demo</h1>
      </div>

      <p className={'token'}>{token}</p>
      <JSONPretty data={decoded}/>


      <button onClick={() => dispatch({type: GET_TOKEN_REQUEST})}>Get Token</button>
      <button onClick={load_files}>Get Files</button>
      <button onClick={create_file_upload}>Upload File</button>

      <hr />
      {drop_zone()}
      <hr />

      <h2>Files Ready For Upload</h2>
      {readyToUploadFiles.length > 0 &&
      <>
        <table>
          <tbody>
          {readyToUploadFiles.map(f => (<tr key={f.filename}>
            <td>{f.id}</td>
            <td>{f.name}</td>
            <td>{f.size} bytes</td>
            <td>{f.type}</td>
          </tr>))}
          </tbody>
        </table>
      </>
      }
      <hr />

      <h2>Files Uploaded</h2>
      {files.length > 0 &&
      <>
        <table>
          <tbody>
          {files.map(f => (<tr key={f.id}>
            <td>{f.filename}</td>
            <td>{f.status}</td>
            <td>{f.created_at}</td>
            <td>
              <button onClick={() => run_import(f)}>Import To Nuxeo</button>
            </td>
          </tr>))}
          </tbody>
        </table>
      </>
      }
    </div>
  )

};

const mapStateToProps = (state) => {
  const mappedProps = {
    token: state.Token.token,
  };

  return mappedProps;
}


export default connect(mapStateToProps, null)(LandingPage);
