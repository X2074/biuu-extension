import { createApp } from 'vue'
import app from './components/app.vue'
joinContent(app)
injectJsInsert()

let injectedArray = ['injected/injected.js']

function joinContent (element) {
	const div = document.createElement('div')
	div.id = 'joinContentApp'
	document.body.appendChild(div)
	console.log(div)
	createApp(element).mount('#joinContentApp')
}

function injectJsInsert () {
	document.addEventListener('readystatechange', () => {
		injectedArray.forEach(item => {
			const injectPath = item;
			const script = document.createElement('script')
			script.setAttribute('type', 'text/javascript')
			script.src = chrome.extension.getURL(injectPath)
			document.body.appendChild(script)
		})
	})
}