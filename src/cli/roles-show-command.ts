export interface RolesShowCommand {
  readonly kind: 'roles-show';
  readonly role: string;
  readonly json: boolean;
}
