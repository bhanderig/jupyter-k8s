#!/bin/bash
set -e

# install required cli tool
brew install kubelogin

# kill any process running on the target port
PID=$(lsof -i :9800 | awk 'NR>1 {print $2}')

if [ -n "$PID" ]; then
    echo "Terminating existing process running on port 9800"
    kill -9 $PID
fi

mkdir -p /tmp/eks-certs
echo LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSURCVENDQWUyZ0F3SUJBZ0lJRlFlS0tDOVFOOUF3RFFZSktvWklodmNOQVFFTEJRQXdGVEVUTUJFR0ExVUUKQXhNS2EzVmlaWEp1WlhSbGN6QWVGdzB5TlRBNU1UY3hOekF3TVRkYUZ3MHpOVEE1TVRVeE56QTFNVGRhTUJVeApFekFSQmdOVkJBTVRDbXQxWW1WeWJtVjBaWE13Z2dFaU1BMEdDU3FHU0liM0RRRUJBUVVBQTRJQkR3QXdnZ0VLCkFvSUJBUURNbE83Umh3TWR0TlNKd25YMXA3RjlGWmsxY0dCcUU0YnhrUEgvVFhUQXd4YTI0Q1c2aUlMWVhlNlIKNkRiMzhnUWVaeFhVaWN3b09FbDd6R1BFOGJVYzNkRXdTclNyTytaRXVDR3JVaDhocjI1aWE0Mk5lcXJNSzhkUgpidFpUdGpTVDQvOG8zNnJ1anF2eUtsNHVKSGNmUU44U3c4RlZYVUo3MGw4MkU1aFF0NngwRTlXNXlPbVV0S2t4CktCUHZQRWtvYlAybTlEQkc1NW9adEZZWUcveXJMaW9yVmp6L3dOOS9yWkVxVU5jSDFsY21VaXNoUkdmc0ZVdnQKQjdxZkxGV05XMlRIQVhGRisybkFkRGJqTkFyZlNvR1pCYjlRbUp1a0hmSEI3YXNaUUtxSE52b0Zwa0svS0hkSwp3NWQ2Q1dXTzJ5c09ZdFJWTTRrM0piYWxobk9MQWdNQkFBR2pXVEJYTUE0R0ExVWREd0VCL3dRRUF3SUNwREFQCkJnTlZIUk1CQWY4RUJUQURBUUgvTUIwR0ExVWREZ1FXQkJRZDVOVWx6QXZhSU5hSlkzWEx4YjFibzVYbnB6QVYKQmdOVkhSRUVEakFNZ2dwcmRXSmxjbTVsZEdWek1BMEdDU3FHU0liM0RRRUJDd1VBQTRJQkFRQzBqaEFYa0VxTQpwb09RdzArMERxWG1wL2tQaTlPWG02alp1ZW92d0tTYTFqQWp1Ym4zdjZpU0k2RWVpUEZPWE9sdy9QVnZTM2gwCnlneVhNdGtFdVhpb1hYMlN0cXZIUk5yTmUxZHY0cXMvMDdnZDdmRlBybTJvZ0pQOWtCMGlwTGFhaiszMDQ0YzQKNjBGejJlYkpTQXZMUFpkcHM2V01rN3RGMElrMnpubklqNGJPOVY4Wnk4T3V3WHB3VGh2bDdMNjZXVEdXQ1dRWgpwRmRqcitBdGFhRkRZSStvRnRQZmxoQm9IampzZUFIL1kwbU9YWkdacjZ5WWhmTTU3U1ZiZWZiOTNhN0dyeWZmCllQM3hQRGlqbTUySHhGSnZsS3Q3THUyazN1NDc1b2pHODZpYUtHRUFkZHZpWHllZGZkV1F4Qkt4dUxiNTV3c2IKM2ZrYzRzWHhpTUptCi0tLS0tRU5EIENFUlRJRklDQVRFLS0tLS0K | base64 --decode > /tmp/eks-certs/jupyter-k8s-cluster-ca.crt

kubectl config set-cluster remote-aws-cluster     --embed-certs     --certificate-authority=/tmp/eks-certs/jupyter-k8s-cluster-ca.crt     --server https://470288D0A2D78A7424ADAC77865E18DB.gr7.us-west-2.eks.amazonaws.com

kubectl config set-credentials github-user   --exec-api-version=client.authentication.k8s.io/v1   --exec-interactive-mode=IfAvailable   --exec-command=kubectl   --exec-arg=oidc-login   --exec-arg=get-token   --exec-arg="--oidc-issuer-url=https://kube2.jggg.people.aws.dev/dex"   --exec-arg="--oidc-client-id=kubectl-oidc"   --exec-arg="--listen-address=localhost:9800"   --exec-arg="--oidc-extra-scope=profile"   --exec-arg="--oidc-extra-scope=groups"

kubectl config set-context remote-aws-github     --cluster=remote-aws-cluster     --user=github-user

kubectl config use-context remote-aws-github
