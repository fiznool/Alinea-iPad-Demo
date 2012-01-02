# Alinea iPad Demo

This app showcases a set of features which are intended for use in a retail store environment. It includes:

- Product Browse and Search
- Store Map viewing
- Call Staff for Help

It was developed as a Proof of Concept for a French store, and is intended to be viewed on an iPad 2 running iOS 5. There are two main use-cases for the app:

1. Enclose the iPad in a ruggedised case, covering the Home button, and affix it to the wall. The app can then be used as a self-service tool, similar to a Point of Information kiosk.
2. Deploy the app as a PhoneGap-wrapped application to the App Store. Customers can download the app and use it as they browse the store.

In either case, a live deployment would involve the following:

- The Product Browse and Search feature would integrate with the in-store products database to provide access to the full product catalogue.
- The Store Map feature and Home page would be updateable using a simple web interface, to ensure the app is fully up to date.
- The Call for Help feature would send a message to members of staff in store, indicating a customer is in need of help.

The app was built using HTML5, JavaScript and jQuery Mobile. HTML5 Local Storage is used to store the static product data for fast lookup in this demonstration environment. Ruby and Sinatra are used to serve the files.
