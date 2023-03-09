---
layout: post
title: KYC using Plaid in a swiftui app
description: KYC is a very important part of any financial app. Here's how you can use Plaid to do it in a swiftui app.
date: 2023-03-09 20:19:00 +0500
tags: [swiftui]
image: "images/plaid-kyc.png"
---

I am working on something very cool these days. I am not ready to make it public yet but I can tell you that it's a fintech app. And it's going to be awesome!

Going back to my roots as an iOS engineer I took a deep dive into SwiftUI. I am in love with its imperative style and the fact that it's so easy to use. I am also a big fan of Combine and the fact that it's built into SwiftUI makes it even better.

We have to use plaid for a key function of the app to do KYC. I was a bit worried about how to do it in SwiftUI. But it turned out to be pretty easy. Here's how you can do it in your SwiftUI app.

## Prerequisites

A Plaid account
Xcode 13 or later
A basic understanding of SwiftUI and MVVM architecture

## Step 1: Install Plaid SDK

The first step is to install the Plaid SDK in your project. Plaid provides SDKs for iOS, Android, and web applications. In this tutorial, we will be using the iOS SDK.

You can install the SDK using Cocoapods, Carthage, or Swift Package Manager. For this tutorial, we will use Cocoapods. Add the following line to your Podfile:

{% highlight bash %}
pod 'Plaid'
{% endhighlight %}

Then, run the following command to install the SDK:

{% highlight bash %}
pod install
{% endhighlight %}

## Step 2: Create a Plaid Account

If you haven't already, create a Plaid account and sign up for the KYC service. You will need to provide some information about your app and your company. After you sign up, you will receive a `client_id` and `public_key` that you will use to authenticate your requests.

## Step 3: Create a Plaid Configuration

Create a `PlaidConfiguration` object with your `client_id` and `public_key`. You can also set other options such as the environment (sandbox or production) and the country.

{% highlight swift %}
let configuration = PlaidConfiguration(clientID: "your_client_id", publicKey: "your_public_key", environment: .sandbox, country: .US)
{% endhighlight %}

## Step 4: Present Plaid Link View

Plaid Link is a pre-built UI component that allows users to securely connect their bank accounts. To present the Plaid Link view, create a `PlaidLinkView` with your configuration and present it using a sheet.

{% highlight swift %}
struct ContentView: View {
  @State private var isPresentingPlaidLinkView = false
  @State private var plaidLinkToken: String?

  var body: some View {
    VStack {
      Button("Connect Bank Account") {
        isPresentingPlaidLinkView = true
      }
      .sheet(isPresented: $isPresentingPlaidLinkView) {
        PlaidLinkView(token: plaidLinkToken, configuration: configuration) { result in
          switch result {
          case .success(let token):
            plaidLinkToken = token
            // handle success
          case .failure(let error):
            // handle failure
          }
          isPresentingPlaidLinkView = false
        }
      }
    }
  }
}
{% endhighlight %}

## Step 5: KYC using Plaid
You can use Plaid to perform Know Your Customer (KYC) verification using the `PlaidLinkView`. KYC verification is an important step in financial transactions to ensure that you are complying with regulations and avoiding fraud.

To perform KYC verification using the `PlaidLinkView`, you can use Plaid's Identity API. The Identity API allows you to retrieve various types of personal information about the user, such as name, address, and date of birth, from their linked financial accounts. You can use this information to verify the user's identity and perform KYC checks.

Here's an example of how you could use the Identity API to retrieve the user's name and address after they successfully link their financial account using the `PlaidLinkView`:

{% highlight swift %}
let linkView = PlaidLinkView(
    configuration: .makeTestConfiguration(),
    onSuccess: { success, completion in
        PLKPlaid.createToken(
            with: .sandbox,
            publicKey: "YOUR_PUBLIC_KEY",
            institution: .tartan,
            selectAccount: nil,
            accountFilters: nil,
            publicToken: success.publicToken
        ) { result in
            switch result {
            case .success(let tokenResponse):
                let request = PLKGetIdentityRequest(
                    accessToken: tokenResponse.accessToken
                )
                PLKPlaid.client().getIdentity(with: request) { result in
                    switch result {
                    case .success(let identityResponse):
                        let name = identityResponse.accounts.first?.owners.first?.name
                        let address = identityResponse.accounts.first?.owners.first?.addresses.first?.data?.city
                        // Use the name and address for KYC verification
                        completion(true)
                    case .failure(let error):
                        // Handle the error
                        print("Failed to retrieve identity: \(error.localizedDescription)")
                        completion(false)
                    }
                }
            case .failure(let error):
                // Handle the error
                print("Failed to create token: \(error.localizedDescription)")
                completion(false)
            }
        }
    },
    onFailure: { exit, error in
        // Handle the failure
        print("Plaid Link exited with error: \(error?.localizedDescription ?? "")")
    }
)

present(linkView)
{% endhighlight %}

In this example, we create a `PlaidLinkView` and present it. When the user successfully links their financial account, the onSuccess closure is called with a `PLKSuccess` object and a completion handler. Inside the closure, we call the `PLKPlaid.createToken` method to exchange the `publicToken` for an access token. If the exchange is successful, we use the access token to retrieve the user's name and address using the `PLKGetIdentityRequest` and `PLKPlaid.client().getIdentity` method. If there is an error, we handle it by printing an error message. If the user exits Plaid Link before linking their account, the onFailure closure is called with a `PLKExit` object and an optional error. In this example, we handle the failure by printing an error message.

You can modify this example to retrieve other types of personal information using the Identity API, such as date of birth and social security number, depending on your KYC requirements. Be sure to review Plaid's documentation and comply with their requirements and regulations for handling user data.

Hope this helps.
