import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
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
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  isTokenCardVisible: boolean = false;
  isAPICardsVisible: boolean = false;
  isAddUserVisible: boolean = false;
  isAddMultiUserVisible: boolean = false;
  username: string;
  fullName: string;
  usersArray = [];

  userData: AddUser = new AddUser();
  createUserForm: FormGroup;
  result: any = [];
  results: any = [];
  @ViewChild('fileInput') inputEl: ElementRef;
  filename: string;
  constructor(private keycloakHttp: KeycloakHttp,
    private _fb: FormBuilder,
    private xlsxToJsonService: XlsxToJsonService,
    private toastr: ToastrService) {
  }

  ngOnInit() {
    this.createUserForm = this._fb.group({
      username: [''],
      firstName: [''],
      email: ['', Validators.required],
      lastName: ['']
    });
    this.filename = '';
  }
  reset(): void {
    this.isTokenCardVisible = false;
    this.isAPICardsVisible = false;
    this.isAddUserVisible = false;
    this.usersArray = [];
  }

  getUserInfoFromToken(): void {
    this.username = KeycloakService.getUsername();
    this.fullName = KeycloakService.getFullName();
    this.isAPICardsVisible = false;
    this.isTokenCardVisible = true;
    this.isAddUserVisible = false;
  }

  getUsersFromApi(): void {
    this.keycloakHttp.get('http://localhost:8080/auth/admin/realms/angular_keycloak/users?first=0&max=20')
      .map(response => response.json())
      .subscribe(
        result => {
          this.usersArray = result;
          this.isAPICardsVisible = true;
          this.isTokenCardVisible = false;
          this.isAddUserVisible = false;
          this.isAddMultiUserVisible = false;
        },
        error => console.log(error),
        () => console.log('Request Completed :: AppComponent.getUsersFromJsonAPI()')
      );
  }
  openAddUser() {
    this.isAPICardsVisible = false;
    this.isTokenCardVisible = false;
    this.isAddUserVisible = true;
    this.isAddMultiUserVisible = false;
  }
  createUser(userData): void {
    console.log(this.userData);
    const credentials = [
      {
        'type': 'password',
        'value': 'myPassword'
      }
    ];
    userData['credentials'] = credentials;
    this.keycloakHttp.post('http://localhost:8080/auth/admin/realms/angular_keycloak/users', userData)
      .subscribe(
        result => {
          console.log(result);
          this.toastr.success(' User is added successfully');
          this.getUsersFromApi();
        },
        error => {
          console.log(error);
          this.toastr.error(JSON.parse(error._body).errorMessage);
        }
      () => console.log('Request Completed :: AppComponent.getUsersFromJsonAPI()')
      );
  }

  openAddMultipleUser(): void {
    this.isAPICardsVisible = false;
    this.isTokenCardVisible = false;
    this.isAddUserVisible = false;
    this.isAddMultiUserVisible = true;
  }

  logout(): void {
    KeycloakService.logout();
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
  addUsers(data) {
    if (data) {
      for (const key of this.result) {
        key['enabled'] = true;
        key['emailVerified'] = '';
        this.createUser(key);
      }
    }
  }
}


// {
//     "username": "rodrigo.sasaki",
//     "enabled": true,
//     "totp": false,
//     "emailVerified": false,
//     "firstName": "Rodrigo",
//     "lastName": "Sasaki",
//     "email": "rodrigo.sasaki at email.com.br",
//     "credentials": [
//         {
//             "type": "password",
//             "value": "myPassword"
//         }
//     ]
// }



export class AddUser {
  username: string;
  enabled: boolean = true,
  emailVerified: string = '';
  firstName: string;
  lastName: string;
  email: string;
}
