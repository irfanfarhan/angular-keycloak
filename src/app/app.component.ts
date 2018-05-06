import { Component, OnInit, ViewChild, ElementRef, AnimationTransitionEvent } from '@angular/core';
import { KeycloakService } from './keycloak/keycloak.service';
import { KeycloakHttp } from './keycloak/keycloak.http';
import { environment } from '../environments/environment';
import {
  FormGroup,
  FormBuilder,
  FormControl,
  Validators
} from '@angular/forms';
import { XlsxToJsonService } from './xlsx-to-json-service';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  assignedRoles: any;
  availableRoles: any;
  effectiveRoles: any;
  filteredItems: any;
  rolesArray: any;
  realm: string;
  email: string;
  isEditable: boolean = false;
  isTokenCardVisible: boolean = false;
  isAPICardsVisible: boolean = false;
  isAddUserVisible: boolean = false;
  isAddMultiUserVisible: boolean = false;
  isRoleAllVisible: boolean = false;
  isAddRoleVisible: boolean = false;
  isRoleEditable: boolean = false;
  username: string;
  fullName: string;
  usersArray = [];
  name: any;
  search: any;
  searchRole: any;
  first: any;
  max: number;
  pervious: number;
  userData: AddUser = new AddUser();
  credentials: Credentials = new Credentials();
  createUserForm: FormGroup;
  createRoleForm: FormGroup;
  roleData: AddRole = new AddRole();
  result: any = [];
  results: any = [];
  _opened: boolean = true;
  _mode: string = 'push';
  _position: string = 'left';
  _animate: boolean = true;
  @ViewChild('fileInput') inputEl: ElementRef;
  filename: string;
  constructor(private keycloakHttp: KeycloakHttp,
    private _fb: FormBuilder,
    private xlsxToJsonService: XlsxToJsonService,
    private toastr: ToastrService) {
  }

  ngOnInit() {
    this.first = 0;
    this.max = 20;
    this.createUserForm = this._fb.group({
      username: [''],
      firstName: [''],
      email: ['', Validators.required],
      lastName: [''],
      confirmPassword: [''],
      password: ['']
    });
    this.createRoleForm = this._fb.group({
      name: ['', Validators.required],
      description: ['']
    });
    this.filename = '';
    this.getUserInfoFromToken();
  }

  // Reset the all the functions
  reset(): void {
    this.isTokenCardVisible = false;
    this.isAPICardsVisible = false;
    this.isAddUserVisible = false;
    this.isAddMultiUserVisible = false;
    this.isRoleAllVisible = false;
    this.isEditable = false;
    this.isAddRoleVisible = false;
    this.isRoleEditable = false;
    this.usersArray = [];
  }

  // Get User Information

  getUserInfoFromToken(): void {
    this.username = KeycloakService.getUsername();
    this.fullName = KeycloakService.getFullName();
    this.email = KeycloakService.getEmail();
    this.realm = KeycloakService.getRealm();
    this.isAPICardsVisible = false;
    this.isTokenCardVisible = true;
    this.isAddUserVisible = false;
    this.isAddMultiUserVisible = false;
    this.isRoleAllVisible = false;
    this.isEditable = false;
    this.isAddRoleVisible = false;
    this.isRoleEditable = false;
  }

  // Open All users tab anf get all users function

  getUsersFromApi(query?: any): void {
    let url = environment.keycloakRootUrl + '/admin/realms/' + this.realm + '/users?first=' + this.first + '&max=' + this.max;
    if (query) {
      url = environment.keycloakRootUrl + '/admin/realms/' + this.realm + '/users?first=' + this.first + '&max=' + this.max + '&search=' + query;
    }
    this.keycloakHttp.get(url)
      .map(response => response.json())
      .subscribe(
        result => {
          this.usersArray = result;
          this.isAPICardsVisible = true;
          this.isTokenCardVisible = false;
          this.isAddUserVisible = false;
          this.isAddMultiUserVisible = false;
          this.isEditable = false;
          this.isRoleAllVisible = false;
          this.isAddRoleVisible = false;
          this.isRoleEditable = false;
          this.filename = '';
          this.result = [];
          this.results = [];
        },
        error => console.log(error),
        () => console.log('Request Completed :: AppComponent.getUsersFromJsonAPI()')
      );
  }

  // Open User tab and Add user function

  openAddUser() {
    this.isAPICardsVisible = false;
    this.isTokenCardVisible = false;
    this.isAddUserVisible = true;
    this.isAddMultiUserVisible = false;
    this.isRoleAllVisible = false;
    this.isEditable = false;
    this.isAddRoleVisible = false;
    this.isRoleEditable = false;
    this.userData = new AddUser();
    this.credentials['value'] = 'welcome1';
    this.createUserForm.controls['confirmPassword'].reset();
    this.createUserForm.get('username').enable();
  }

  createUser(userData): void {
    if (userData.id) {
      const url = environment.keycloakRootUrl + '/admin/realms/' + this.realm + '/users/' + userData.id;
      this.keycloakHttp.put(url, userData)
        .subscribe(
          result => {
            this.toastr.success(userData.username + ' is updated successfully.');
            this.setPassword(url);
          },
          error => {
            console.log(error);
            this.toastr.error(JSON.parse(error._body).errorMessage);
          }
        );
    } else {
      const url = environment.keycloakRootUrl + '/admin/realms/' + this.realm + '/users';
      this.keycloakHttp.post(url, userData)
        .subscribe(
          result => {
            this.toastr.success(' User is added successfully.');
            this.setPassword(result.headers.values()[0][0]);
          },
          error => {
            console.log(error);
            this.toastr.error(JSON.parse(error._body).errorMessage);
          }
        );
    }
  }

  setPassword(api?: any) {
    const url = api + '/reset-password';
    this.keycloakHttp.put(url, this.credentials)
      .subscribe(
        result => {
          this.editUser('', api);
        },
        error => {
          console.log(error);
          this.toastr.error(JSON.parse(error._body).errorMessage);
        }
      );
  }
  deleteUser(data) {
    const url = environment.keycloakRootUrl + '/admin/realms/' + this.realm + '/users/' + data.id;
    this.keycloakHttp.delete(url)
      .subscribe(
        result => {
          this.toastr.success(data.username + ' user is deleted successfully.');
          this.getUsersFromApi();
        },
        error => {
          console.log(error);
          this.toastr.error(JSON.parse(error._body).errorMessage);
        }
      );
  }

  editUser(data?:any, query?:any) {
    let url = environment.keycloakRootUrl + '/admin/realms/' + this.realm + '/users/' + data.id;
    if (query) {
      url = query;
    }
    this.keycloakHttp.get(url)
      .map(response => response.json())
      .subscribe(
        result => {
          console.log(result);
          this.isAPICardsVisible = false;
          this.isTokenCardVisible = false;
          this.isAddUserVisible = true;
          this.isAddMultiUserVisible = false;
          this.isRoleAllVisible = false;
          this.userData = result;
          this.isEditable = true;
          this.isAddRoleVisible = false;
          this.isRoleEditable = false;
          this.createUserForm.get('username').disable();
          this.createUserForm.controls['confirmPassword'].reset();
          this.credentials = new Credentials();
          this.getAssignedRoles(result);
          this.getRolesMapping(result, 'composite');
          this.getRolesMapping(result, 'available');
         },
        error => console.log(error),
        () => console.log('Request Completed :: AppComponent.getUsersFromJsonAPI()')
      );
  }

  getRolesMapping(data, value?:any){
    let url = environment.keycloakRootUrl + '/admin/realms/' + this.realm + '/users/' + data.id + '/role-mappings/realm/' + value;
    this.keycloakHttp.get(url)
      .map(response => response.json())
      .subscribe(
        result => {
          console.log(result);
          if(value === 'composite'){
            this.effectiveRoles = result;
          }
          if(value === 'available'){
            this.availableRoles = result;
          } 
         },
        error => console.log(error)
       );
  }
  getAssignedRoles(data,){
    const url =  environment.keycloakRootUrl + '/admin/realms/' + this.realm + '/users/' + data.id + '/role-mappings/realm';
     this.keycloakHttp.get(url)
      .map(response => response.json())
      .subscribe(
        result => {
          console.log(result);
            this.assignedRoles = result;
         },
        error => console.log(error)
       );
  }
  grantAccess(data) {
    const requestPayload = { "realm": this.realm, "user": data.id }
    const url = environment.keycloakRootUrl + '/admin/realms/' + this.realm + '/users/' + data.id + '/impersonation';
    this.keycloakHttp.post(url, requestPayload)
      .subscribe(
        result => {
          console.log(result.json().redirect);
          const url = result.json().redirect;
          window.open(url, "_blank");
        },
        error => {
          console.log(error);
          this.toastr.error(JSON.parse(error._body).errorMessage);
        }
      );
  }
  // Open Multiple User tab and Add multiple user function

  openAddMultipleUser(): void {
    this.isAPICardsVisible = false;
    this.isTokenCardVisible = false;
    this.isAddUserVisible = false;
    this.isAddMultiUserVisible = true;
    this.isEditable = false;
    this.isRoleAllVisible = false;
    this.isAddRoleVisible = false;
    this.isRoleEditable = false;
    this.filename = '';
    this.result = [];
    this.results = [];
  }

  handleFile(event) {
    const inputEl: HTMLInputElement = this.inputEl.nativeElement;

    if (inputEl.files.length === 0) {
      return;
    } else {
      this.filename = '';
      const files: FileList = inputEl.files;
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        if (files.length === 1) {
          this.filename += files[i].name;
          this.filename = this.filename.replace(/\\/g, '/').replace(/.*\//, '').substring(0, 25);
        } else {
          this.filename = files.length + ' Files Selected';
        }
      }
    }
    const file = event.target.files[0];
    this.xlsxToJsonService.processFileToJson([], file).subscribe(data => {
      this.result = data['sheets'].Sheet1;
      this.results = JSON.stringify(this.result);
    });
  }

  addMultipleUsers(data) {
    if (data) {
      for (const key of this.result) {
        key['enabled'] = true;
        key['emailVerified'] = '';
        this.createUser(key);
      }
    }
  }
  // Open Roles Tab and Get all roles function 

  getAllRoles(): void {
    let url = environment.keycloakRootUrl + '/admin/realms/' + this.realm + '/roles';
    this.keycloakHttp.get(url)
      .map(response => response.json())
      .subscribe(
        result => {
          this.rolesArray = result;
          this.isAPICardsVisible = false;
          this.isTokenCardVisible = false;
          this.isAddUserVisible = false;
          this.isAddMultiUserVisible = false;
          this.isEditable = false;
          this.isRoleAllVisible = true;
          this.isAddRoleVisible = false;
          this.isRoleEditable = false;
          this.filename = '';
          this.result = [];
          this.results = [];
          this.assignCopy();
        },
        error => console.log(error),
        () => console.log('Request Completed :: AppComponent.getUsersFromJsonAPI()')
      );
  }

  addRole(){
    this.isAPICardsVisible = false;
    this.isTokenCardVisible = false;
    this.isAddUserVisible = false;
    this.isAddMultiUserVisible = false;
    this.isRoleAllVisible = false;
    this.isEditable = false;
    this.isAddRoleVisible = true;
    this.isRoleEditable = false;
    this.createRoleForm.get('name').enable();
  }
  createRole(roleData): void {
    if (roleData.id) {
      const url = environment.keycloakRootUrl + '/admin/realms/' + this.realm + '/roles-by-id/' + roleData.id;
      this.keycloakHttp.put(url, roleData)
        .subscribe(
          result => {
            this.toastr.success(roleData.name + ' role is updated successfully.');
            this.getAllRoles();
          },
          error => {
            console.log(error);
            this.toastr.error(JSON.parse(error._body).errorMessage);
          }
        );
    } else {
      const url = environment.keycloakRootUrl + '/admin/realms/' + this.realm + '/roles';
      this.keycloakHttp.post(url, roleData)
        .subscribe(
          result => {
            this.toastr.success('Role is added successfully.');
            this.getAllRoles();
           },
          error => {
            console.log(error);
            this.toastr.error(JSON.parse(error._body).errorMessage);
          }
        );
    }
  }

  editRole(role) {
    console.log(role);
    this.isAPICardsVisible = false;
    this.isTokenCardVisible = false;
    this.isAddUserVisible = false;
    this.isAddMultiUserVisible = false;
    this.isRoleAllVisible = false;
    this.roleData = role;
    this.isEditable = false;
    this.isAddRoleVisible = true;
    this.isRoleEditable = true;
    this.createRoleForm.get('name').disable();
  }
  deleteRole(role) {
    const url = environment.keycloakRootUrl + '/admin/realms/' + this.realm + '/roles-by-id/' + role.id;
    this.keycloakHttp.delete(url)
      .subscribe(
        result => {
          this.toastr.success(role.name + ' role is deleted successfully.');
          this.getAllRoles();
        },
        error => {
          console.log(error);
          this.toastr.error(JSON.parse(error._body).errorMessage);
        }
      );
  }

  // Search the all user functions

  searchRecords(query) {
    console.log(query);
    this.getUsersFromApi(query);
  }

  //  Search for all roles functions

  assignCopy() {
    this.filteredItems = Object.assign([], this.rolesArray);
  }
  searchRoles(value) {
    if (!value) this.assignCopy(); //when nothing has typed
    this.filteredItems = Object.assign([], this.rolesArray).filter(
      item => item.name.toLowerCase().indexOf(value.toLowerCase()) > -1
    )
  }

// Pagination function for users

firstPage() {
  this.first = 0;
  this.max = 20;
  this.getUsersFromApi();
}
previousPage() {
  this.first = this.first - 20;
  this.getUsersFromApi();
}
nextPage() {
  this.first = this.first + 20;
  this.getUsersFromApi();
}

// Logout Function

logout(): void {
  KeycloakService.logout();
}

formatText(data) {
  if (data) {
    console.log(data);
    let format = data.split(' ');
    format = format.charAt(0).toUpperCase().substr(3);
    console.log(format);
  }
}

transform(value) {
  if (!value) return value;
  return value.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.charAt(1).toUpperCase() + txt.charAt(2).toUpperCase() + txt.substr(3).toLowerCase();
  });
}
}


export class AddUser {
  username: string;
  enabled: boolean = true;
  emailVerified: string = '';
  firstName: string;
  lastName: string;
  email: string;
  createdTimestamp: string;
  id: string;
}

export class Credentials {
  type: string = 'password';
  value: string;
  temporary: boolean = true;
}

export class AddRole {
  name: string;
  scopeParamRequired: boolean = false;
  description: string;
  composite: boolean = false;
  clientRole: boolean = false;
  containerId: string;
  id: string;
}
