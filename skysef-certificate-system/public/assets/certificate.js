const params = new URLSearchParams(window.location.search);
const state = {
  name: params.get('name') || 'Name',
  school: params.get('school') || 'School'
};

const $ = (id) => document.getElementById(id);

function apply() {
  $('name').textContent = state.name || 'Name';
  $('school').textContent = state.school || 'School';
  $('inputName').value = state.name;
  $('inputSchool').value = state.school;
}

$('inputName').addEventListener('input', (event) => {
  state.name = event.target.value;
  $('name').textContent = state.name || 'Name';
});

$('inputSchool').addEventListener('input', (event) => {
  state.school = event.target.value;
  $('school').textContent = state.school || 'School';
});

apply();
