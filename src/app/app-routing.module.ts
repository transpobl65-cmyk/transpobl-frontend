import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { SolicitudesComponent } from './components/solicitudes/solicitudes.component';
import { CoordinacionComponent } from './components/coordinacion/coordinacion.component';
import { GastosEmpresaComponent } from './components/gastos-empresa/gastos-empresa.component';
import { GastosConductorComponent } from './components/gastos-conductor/gastos-conductor.component';
import { CuerpoComponent } from './components/cuerpo/cuerpo.component';
import { EstadoCarrosComponent } from './components/estadocarros/estadocarros.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    children: [
      { path: '', redirectTo: 'cuerpo', pathMatch: 'full' },
      { path: 'cuerpo', component: CuerpoComponent },
      { path: 'gastos-empresa', component: GastosEmpresaComponent

       }, // luego reemplazamos por GastosComponent
      { path: 'estado-carros', component: EstadoCarrosComponent},
      { path: 'solicitudes', component: SolicitudesComponent },
      { path: 'coordinacion', component: CoordinacionComponent },
      { path: 'gastos-conductor', component: GastosConductorComponent},


    ]
  },
  { path: '**', redirectTo: 'login' }

 // { path: 'gastos-empresa', component: GastosEmpresaComponent },
  //{ path: 'gastos-conductor', component: GastosConductorComponent},
 // { path: 'solicitudes', component: SolicitudesComponent },
  //{ path: 'vehiculos', component: EstadocarrosComponent },
  //{ path: 'coordinacion', component: CoordinacionComponent },
  

];

@NgModule({

 
  imports: [RouterModule.forRoot(routes),

  ],
  exports: [RouterModule]
})

export class AppRoutingModule { }
