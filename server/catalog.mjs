export const INITIAL_PRODUCTS = [
 ['magnum','Kurto Magnum',2600,'Chocolate','Cono de canela, helado de chocolate, dulce de leche, galleta y virutas, barra y chocolate derretido, malvavisco.',412,211],
 ['oreo','Kurto Oreo',2500,'Vainilla','Cono de canela, vainilla, chocolate de avellana, Oreo molido y galleta Oreo, malvavisco.',722,198],
 ['coconut','Kurto Coconut',2600,'Mixto','Cono de canela, vainilla y chocolate, dulce de leche, coco rallado y malvaviscos flameados.',442,617],
 ['coffee','Kurto Coffee',2500,'Vainilla','Cono de canela, vainilla, ganache de café, crema de leche, chips de chocolate, galleta champagne y malvavisco.',744,610],
 ['top','Kurto Top',2600,'Dos sabores','Cono de canela, dos sabores de helado, chocolate de avellana, dos frutas, tableta de chocolate y malvavisco.',428,1030],
 ['clasico','Kurto Clásico',2200,'Clásicos','Cono de canela, un sabor de helado, chocolate de avellana, una fruta y malvavisco.',710,1040],
 ['crema','Kurto Crema',1500,'Sin helado','Cono de canela, frutillas, chocolate de avellana, crema de leche y malvavisco.',365,1390],
 ['dulce','Kurto Dulce',700,'Sin helado','Cono de canela con chocolate de avellana, dulce de leche, pistacho o chocolate semiamargo.',850,1310]
].map(([id,name,price,category,description,x,y])=>({id,name,price,category,description,x,y,enabled:true,...(id==='dulce'?{variants:['Chocolate de avellana','Dulce de leche','Pistacho','Chocolate semiamargo']}:id==='clasico'?{variants:['Vainilla','Chocolate','Fresa']}:id==='top'?{variants:['Vainilla + chocolate','Vainilla + fresa','Chocolate + fresa']}:{} )}));
export const CUSTOM={base:1800,cone:[0,300,200],filling:[0,400,400,300],ice:[800,900,900,0],topping:200};
export const CUSTOM_NAMES={cone:['Canela','Cacao','Vainilla'],filling:['Sin relleno','Chocolate de avellana','Dulce de leche','Fresa'],ice:['Vainilla','Chocolate','Fresa','Sin helado'],topping:['Frutilla','Malvaviscos','Oreo triturado','Salsa de chocolate']};
