import { Injectable } from '@angular/core';
import { ErrorsService } from './tools/errors.service';
import { ValidatorService } from './tools/validator.service';
import { FacadeService } from './facade.service';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class EventoService {

  constructor(
    private http: HttpClient,
    private errorService: ErrorsService,
    private validatorService: ValidatorService,
    private facadeService: FacadeService
  ) { }

  public esquemaEvento(){
    return {
      'nombre_evento': '',
      'tipo_evento': '',
      'fecha_evento': '',
      'hora_inicio': '',
      'hora_final': '',
      'lugar': '',
      'publico_json': [],
      'programa_educativo': '',
      'responsable_evento': '',
      'descripcion': '',
      'cupo': ''
    }
  }

    //Validacion para el formulario evento
    public validarEvento(data: any, editar: boolean){
    console.log("Validando evento... ", data);

    let error: any = [];
    //NOMBRE DEL EVENTO
    if(!this.validatorService.required(data["nombre_evento"])){
      error["nombre_evento"] = this.errorService.required;
    }
    //TIPO DE EVENTO
    if(!this.validatorService.required(data["tipo_evento"])){
      error["tipo_evento"] = this.errorService.required;
    }

    //FECHA DE EVENTO
    if(!this.validatorService.required(data["fecha_evento"])){
      error["fecha_evento"] = this.errorService.required;
    }

    //HORA INICIO
    if(!this.validatorService.required(data["hora_inicio"])){
      error["hora_inicio"] = this.errorService.required;
    }

    //HORA FINAL
    if(!this.validatorService.required(data["hora_final"])){
      error["hora_final"] = this.errorService.required;
    }

    //LUGAR
    if(!this.validatorService.required(data["lugar"])){
      error["lugar"] = this.errorService.required;
    }

    //PUBLICO
    if(!this.validatorService.required(data["publico_json"])){
      error["publico_json"] = "Debes seleccionar algun publico para poder registrate";
    }

    //PROGRAMA EDUCATIVO
    if (data["publico_json"] && data["publico_json"].includes("Estudiante")) {
      if (!this.validatorService.required(data["programa_educativo"])) {
        error["programa_educativo"] = this.errorService.required;
      }
    }

    //RESPONSABLE DE EVENTO
    if(!this.validatorService.required(data["responsable_evento"])){
      error["responsable_evento"] = this.errorService.required;
    }

    //DESCRIPCION
    if(!this.validatorService.required(data["descripcion"])){
      error["descripcion"] = this.errorService.required;
    }

    //CUPO
    if(!this.validatorService.required(data["cupo"])){
      error["cupo"] = this.errorService.required;
    }


    //Return arreglo
    return error;
  }

  //Servicio para registrar un nuevo evento
    public registrarEvento (data: any): Observable <any>{
      return this.http.post<any>(`${environment.url_api}/eventos/`,data, httpOptions);
  }

  //Obtener lista de eventos
  public obtenerListaEventos (): Observable <any>{
    var token = this.facadeService.getSessionToken();
    var headers = new HttpHeaders({ 'Content-Type': 'application/json' , 'Authorization': 'Bearer '+token});
    return this.http.get<any>(`${environment.url_api}/lista-eventos/`, {headers:headers});
  }

  //Obtener un solo evento dependiendo su ID
  public getEventoByID(idUser: Number){
    return this.http.get<any>(`${environment.url_api}/eventos/?id=${idUser}`,httpOptions);
  }

  //Servicio para actualizar evento
  public editarEvento (data: any): Observable <any>{
    var token = this.facadeService.getSessionToken();
    var headers = new HttpHeaders({ 'Content-Type': 'application/json' , 'Authorization': 'Bearer '+token});
    return this.http.put<any>(`${environment.url_api}/eventos-edit/`, data, {headers:headers});
  }

  //Eliminar evento
  public eliminarEvento(idUser: number): Observable <any>{
  var token = this.facadeService.getSessionToken();
  var headers = new HttpHeaders({ 'Content-Type': 'application/json' , 'Authorization': 'Bearer '+token});
  return this.http.delete<any>(`${environment.url_api}/eventos-edit/?id=${idUser}`,{headers:headers});
  }
}
